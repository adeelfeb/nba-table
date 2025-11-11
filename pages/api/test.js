// Example API endpoint
// Access at: http://localhost:3000/api/test

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Example: Test MongoDB connection
      // const client = await clientPromise;
      // const db = client.db();
      // const collections = await db.listCollections().toArray();
      
      res.status(200).json({
        success: true,
        message: 'API is working!',
        timestamp: new Date().toISOString(),
        // collections: collections.map(c => c.name) // Uncomment when testing DB
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error processing request',
        error: error.message,
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}

