import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topicId } = await req.json();

    if (!topicId) {
      throw new Error('Topic ID is required');
    }

    console.log('Querying Hedera mirror node for topic:', topicId);
    
    // Query Hedera testnet mirror node
    const mirrorUrl = `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages`;
    const response = await fetch(mirrorUrl);
    
    if (!response.ok) {
      throw new Error(`Mirror node error: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('Found messages:', data.messages?.length || 0);

    // Parse messages
    const events = data.messages?.map((msg: any) => {
      try {
        const decoded = atob(msg.message);
        const parsed = JSON.parse(decoded);
        return {
          ...parsed,
          sequenceNumber: msg.sequence_number,
          consensusTimestamp: new Date(parseFloat(msg.consensus_timestamp) * 1000).toISOString(),
        };
      } catch (e) {
        console.error('Error parsing message:', e);
        return null;
      }
    }).filter(Boolean) || [];

    return new Response(
      JSON.stringify({ 
        success: true,
        events,
        count: events.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error querying events:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
