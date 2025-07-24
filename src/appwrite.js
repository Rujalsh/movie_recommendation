// Fixed appwrite.js
import { Client, Databases, ID, Query } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

// Debug Appwrite configuration
console.log("Appwrite Config:", {
  PROJECT_ID: !!PROJECT_ID,
  DATABASE_ID: !!DATABASE_ID,
  COLLECTION_ID: !!COLLECTION_ID,
});

const client = new Client()
  .setEndpoint("https://nyc.cloud.appwrite.io/v1")
  .setProject(PROJECT_ID);

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
  // Skip if Appwrite is not configured
  if (!PROJECT_ID || !DATABASE_ID || !COLLECTION_ID) {
    console.warn("Appwrite not configured, skipping search count update");
    return;
  }

  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("searchTerm", searchTerm),
    ]);

    if (result.documents.length > 0) {
      const doc = result.documents[0];
      await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        count: doc.count + 1,
      });
    } else {
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm,
        count: 1,
        movie_id: movie.id,
        title: movie.title,
        poster_url: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : null,
      });
    }
  } catch (error) {
    console.error("Appwrite error:", error);
    // Don't throw the error - let the app continue working
  }
};

export const getTrendingMovies = async () => {
  // Skip if Appwrite is not configured
  if (!PROJECT_ID || !DATABASE_ID || !COLLECTION_ID) {
    console.warn("Appwrite not configured, returning empty trending movies");
    return [];
  }

  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc("count"),
    ]);

    return result.documents || [];
  } catch (error) {
    console.error("Appwrite error:", error);
    // Return empty array instead of throwing error
    return [];
  }
};
