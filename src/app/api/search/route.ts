import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import { Client } from '@elastic/elasticsearch';

async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }

  const token = authHeader.split('Bearer ')[1];
  return await adminAuth.verifyIdToken(token);
}

// Initialize Elasticsearch client
const elasticClient = new Client({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || '',
  },
});

// GET - Search users using Elasticsearch
export async function GET(request: NextRequest) {
  try {
    await verifyToken(request);

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const role = searchParams.get('role');
    const location = searchParams.get('location');
    const interests = searchParams.get('interests')?.split(',');

    if (!query && !role && !location && !interests) {
      return NextResponse.json(
        { error: 'At least one search parameter is required' },
        { status: 400 }
      );
    }

    // Build Elasticsearch query
    const searchQuery: any = {
      bool: {
        must: [],
        filter: [],
      },
    };

    // Add text search if query provided
    if (query) {
      searchQuery.bool.must.push({
        multi_match: {
          query,
          fields: ['name^3', 'bio^2', 'interests', 'location'],
          fuzziness: 'AUTO',
        },
      });
    }

    // Add filters
    if (role) {
      searchQuery.bool.filter.push({ term: { role } });
    }

    if (location) {
      searchQuery.bool.filter.push({ term: { location } });
    }

    if (interests && interests.length > 0) {
      searchQuery.bool.filter.push({
        terms: { interests },
      });
    }

    const { hits } = await elasticClient.search({
      index: 'users',
      query: searchQuery,
      size: 20,
    });

    const results = hits.hits.map((hit: any) => ({
      id: hit._id,
      score: hit._score,
      ...hit._source,
    }));

    return NextResponse.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error: any) {
    console.error('Search error:', error);

    // Handle Elasticsearch connection errors gracefully
    if (error.message?.includes('ECONNREFUSED') || error.name === 'ConnectionError') {
      return NextResponse.json(
        {
          error: 'Search service unavailable. Please try again later.',
          fallback: true,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
