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
    const { productName, productDescription } = await req.json();
    
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

    // Import Hedera SDK
    const { Client, TopicCreateTransaction, PrivateKey } = await import("npm:@hashgraph/sdk");

    const accountId = Deno.env.get('HEDERA_ACCOUNT_ID');
    const privateKey = Deno.env.get('HEDERA_PRIVATE_KEY');

    if (!accountId || !privateKey) {
      throw new Error('Hedera credentials not configured');
    }

    console.log('Creating Hedera client for testnet...');
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

    console.log('Creating topic for product:', productName);
    const transaction = new TopicCreateTransaction()
      .setTopicMemo(`Supply Chain: ${productName}`);

    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const topicId = receipt.topicId?.toString();

    if (!topicId) {
      throw new Error('Failed to create topic');
    }

    console.log('Topic created:', topicId);

    // Store in database
    const { data: product, error: dbError } = await supabase
      .from('products')
      .insert({
        topic_id: topicId,
        name: productName,
        description: productDescription,
        created_by: user.id,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    client.close();

    return new Response(
      JSON.stringify({ 
        success: true, 
        topicId,
        product 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating topic:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
