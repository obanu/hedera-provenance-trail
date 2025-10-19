import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topicId, eventType, location, details } = await req.json();
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Get product
    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('topic_id', topicId)
      .single();

    if (!product) {
      throw new Error('Product not found');
    }

    // Import Hedera SDK
    const { Client, TopicMessageSubmitTransaction, PrivateKey } = await import("npm:@hashgraph/sdk");

    const accountId = Deno.env.get('HEDERA_ACCOUNT_ID');
    const privateKey = Deno.env.get('HEDERA_PRIVATE_KEY');

    if (!accountId || !privateKey) {
      throw new Error('Hedera credentials not configured');
    }

    console.log('Creating Hedera client...');
    const client = Client.forTestnet();
    
    // Parse private key - try ED25519 first (most common), then DER format
    let key;
    try {
      key = PrivateKey.fromStringED25519(privateKey);
    } catch {
      try {
        key = PrivateKey.fromStringDer(privateKey);
      } catch {
        key = PrivateKey.fromStringECDSA(privateKey);
      }
    }
    
    client.setOperator(accountId, key);

    const message = JSON.stringify({
      eventType,
      location,
      details,
      timestamp: new Date().toISOString(),
      createdBy: user.id,
    });

    console.log('Submitting message to topic:', topicId);
    const transaction = new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(message);

    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);
    
    console.log('Message submitted, status:', receipt.status.toString());

    // Store in database for caching
    const { data: event, error: dbError } = await supabase
      .from('product_events')
      .insert({
        product_id: product.id,
        event_type: eventType,
        location,
        details,
        sequence_number: Date.now(), // Temporary, will be updated when querying mirror
        consensus_timestamp: new Date().toISOString(),
        created_by: user.id,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    client.close();

    return new Response(
      JSON.stringify({ 
        success: true,
        event,
        status: receipt.status.toString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error submitting event:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
