import { Client } from '@elastic/elasticsearch';

// Initialize Elasticsearch client
const elasticClient = new Client({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || '',
  },
});

// Helper function to index a user profile
export async function indexUserProfile(userId: string, userData: any) {
  try {
    await elasticClient.index({
      index: 'users',
      id: userId,
      document: {
        ...userData,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Error indexing user:', error);
    throw error;
  }
}

// Helper function to search users
export async function searchUsers(query: string, filters?: any) {
  try {
    const { hits } = await elasticClient.search({
      index: 'users',
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query,
                fields: ['name', 'bio', 'interests', 'location'],
                fuzziness: 'AUTO',
              },
            },
          ],
          filter: filters ? Object.entries(filters).map(([key, value]) => ({
            term: { [key]: value },
          })) : [],
        },
      },
    });
    return hits.hits.map((hit: any) => ({
      id: hit._id,
      score: hit._score,
      ...hit._source,
    }));
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
}

// Helper function to update user in index
export async function updateUserInIndex(userId: string, updates: any) {
  try {
    await elasticClient.update({
      index: 'users',
      id: userId,
      doc: updates,
    });
  } catch (error) {
    console.error('Error updating user in index:', error);
    throw error;
  }
}

// Helper function to delete user from index
export async function deleteUserFromIndex(userId: string) {
  try {
    await elasticClient.delete({
      index: 'users',
      id: userId,
    });
  } catch (error) {
    console.error('Error deleting user from index:', error);
    throw error;
  }
}

export default elasticClient;
