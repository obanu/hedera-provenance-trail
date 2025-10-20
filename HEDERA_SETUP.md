# Hedera Provenance Tracker - Setup Guide

## Overview
This application demonstrates supply chain provenance tracking using the Hedera Consensus Service (HCS). It allows producers to log product events and consumers to verify product history through immutable, timestamped records on the Hedera network.

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- A Hedera Testnet account (instructions below)

## 1. Setting Up Hedera Testnet Account

### Create a Testnet Account
1. Visit the [Hedera Portal](https://portal.hedera.com/)
2. Sign up for a free account
3. Navigate to "Testnet" section
4. Create a new testnet account
5. Note your **Account ID** (format: `0.0.xxxxx`) and **Private Key**
6. Your account will be automatically funded with test HBAR

### Alternative: Use Hedera SDK to Generate Account
```javascript
const { Client, PrivateKey, AccountCreateTransaction, Hbar } = require("@hashgraph/sdk");

// Generate new keys
const privateKey = PrivateKey.generateED25519();
const publicKey = privateKey.publicKey;

console.log("Private Key:", privateKey.toString());
console.log("Public Key:", publicKey.toString());
```

## 2. Install Dependencies

```bash
# Install Hedera SDK
npm install @hashgraph/sdk

# Install other dependencies (already in package.json)
npm install
```

## 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Hedera Testnet Configuration
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.xxxxx
HEDERA_OPERATOR_KEY=302e020100300506032b65700422042...

# Mirror Node (Testnet)
HEDERA_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com
```

**Important:** Never commit your `.env` file to version control!

## 4. Backend Implementation

### Key Hedera Operations

#### A. Create Topic for New Product
```javascript
const { Client, TopicCreateTransaction } = require("@hashgraph/sdk");

// Configure client
const client = Client.forTestnet();
client.setOperator(process.env.HEDERA_OPERATOR_ID, process.env.HEDERA_OPERATOR_KEY);

// Create topic
const createTopicTx = await new TopicCreateTransaction()
  .setSubmitKey(client.operatorPublicKey)
  .execute(client);

const receipt = await createTopicTx.getReceipt(client);
const topicId = receipt.topicId;

console.log(`New topic created: ${topicId}`);
```

#### B. Submit Event to Topic
```javascript
const { TopicMessageSubmitTransaction } = require("@hashgraph/sdk");

const message = JSON.stringify({
  eventType: "Harvested",
  productId: "batch-42",
  timestamp: new Date().toISOString(),
  location: "Yirgacheffe, Ethiopia",
  notes: "Hand-picked arabica beans"
});

const submitTx = await new TopicMessageSubmitTransaction()
  .setTopicId(topicId)
  .setMessage(message)
  .execute(client);

const submitReceipt = await submitTx.getReceipt(client);
console.log(`Message submitted with status: ${submitReceipt.status}`);
```

#### C. Query Topic Messages (Mirror Node)
```javascript
const axios = require("axios");

const topicId = "0.0.123456";
const mirrorNodeUrl = `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages`;

const response = await axios.get(mirrorNodeUrl);
const messages = response.data.messages;

messages.forEach(msg => {
  // Decode base64 message
  const decoded = Buffer.from(msg.message, 'base64').toString('utf-8');
  const eventData = JSON.parse(decoded);
  console.log(eventData);
});
```

## 5. Backend API Structure

Create a Node.js/Express backend:

```
backend/
├── server.js
├── routes/
│   ├── products.js      # Create product (topic)
│   └── events.js        # Log events, query history
├── services/
│   ├── hedera.js        # Hedera SDK client setup
│   └── mirror.js        # Mirror node queries
└── .env
```

### Example Express Routes

```javascript
// routes/products.js
const express = require('express');
const router = express.Router();
const { createProductTopic } = require('../services/hedera');

router.post('/create', async (req, res) => {
  try {
    const { name, type, origin } = req.body;
    const topicId = await createProductTopic({ name, type, origin });
    res.json({ success: true, topicId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

## 6. Frontend Integration

Update the frontend to call your backend API:

```typescript
// In Producer.tsx
const handleCreateProduct = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const response = await fetch('/api/products/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: productName, type: productType, origin })
    });
    
    const data = await response.json();
    toast.success(`Product created! Topic ID: ${data.topicId}`);
  } catch (error) {
    toast.error('Failed to create product');
  }
};
```

## 7. Understanding Protobufs

The `@hashgraph/sdk` internally uses [hedera-protobufs](https://github.com/hashgraph/hedera-protobufs) to format transactions and queries. Here's what happens:

1. When you call `new TopicCreateTransaction()`, the SDK:
   - Constructs a `TransactionBody` protobuf message
   - Populates the `consensusCreateTopic` field
   - Serializes it to bytes
   - Signs and sends to a Hedera node

2. The response is also a protobuf message (`TransactionReceipt`) that the SDK deserializes

**You don't need to interact with protobufs directly**—the SDK handles all serialization/deserialization.

## 8. Testing Your Application

### Test Flow
1. Start your backend: `npm run server`
2. Start frontend: `npm run dev`
3. Navigate to Producer Dashboard
4. Create a new product → receives topic ID
5. Log several events (Harvested, Processed, etc.)
6. Navigate to Consumer View
7. Enter topic ID → see complete history

### Verify on Hedera Explorer
Visit [Hedera Testnet Explorer](https://hashscan.io/testnet/) and search for your topic ID to see all messages.

## 9. Cost Analysis (Testnet → Mainnet)

- **Topic Creation**: ~$0.01
- **Message Submission**: ~$0.0001 per message
- **Queries**: Free (mirror nodes)

For a product with 10 lifecycle events, total cost is ~$0.011 on mainnet.

## 10. Switching to Mainnet

When ready for production:

```javascript
// Change client configuration
const client = Client.forMainnet();
client.setOperator(mainnetAccountId, mainnetPrivateKey);

// Update mirror node URL
const mirrorNodeUrl = "https://mainnet-public.mirrornode.hedera.com";
```

**Important:** Mainnet accounts require real HBAR. Purchase from exchanges like Binance, Bittrex, or through MoonPay.

## 11. Optional Extensions

### QR Code Integration
```bash
npm install qrcode
```

```javascript
const QRCode = require('qrcode');

// Generate QR for topic ID
const qrCode = await QRCode.toDataURL(`hedera://topic/${topicId}`);
// Display QR on product packaging
```

### Authentication
- Implement JWT-based auth for producers
- Use role-based access control
- Store product-topic mappings in a database

### Advanced Features
- File attachments (use Hedera File Service)
- Smart contract validation (HCS + smart contracts)
- Real-time event streaming (WebSocket mirror node)

## 12. Troubleshooting

### Common Errors

**"INSUFFICIENT_TX_FEE"**
- Your account needs more HBAR
- For testnet, request more from portal

**"INVALID_SIGNATURE"**
- Check your private key is correct
- Ensure key matches the operator account

**"INVALID_TOPIC_ID"**
- Topic ID format must be `0.0.xxxxx`
- Verify topic exists on network

### Debug Tips
```javascript
// Enable detailed logging
client.setMaxQueryPayment(new Hbar(1));
client.setRequestTimeout(30000);

// Log transaction details
console.log("Transaction ID:", tx.transactionId.toString());
```

## Resources

- [Hedera Documentation](https://docs.hedera.com/)
- [@hashgraph/sdk GitHub](https://github.com/hashgraph/hedera-sdk-js)
- [hedera-protobufs GitHub](https://github.com/hashgraph/hedera-protobufs)
- [HCS Whitepaper](https://hedera.com/hcs)
- [Mirror Node API Docs](https://docs.hedera.com/hedera/sdks-and-apis/rest-api)

## Support

For questions or issues:
- [Hedera Discord](https://hedera.com/discord)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/hedera-hashgraph)
- [GitHub Issues](https://github.com/hashgraph/hedera-sdk-js/issues)

---

**Next Steps:** Complete the backend implementation following the patterns above, then connect it to the frontend forms. The UI is ready—now add the Hedera magic! 🚀
