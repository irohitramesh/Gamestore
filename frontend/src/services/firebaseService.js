// Firebase Firestore Seed Script
// Run this once to populate your Firestore database with game data
// Usage: Include this in a page or run it from browser console after Firebase init

import { db } from '../firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import gamesData from '../data/gamesData';

export const seedGamesToFirestore = async () => {
    const gamesRef = collection(db, 'games');

    // Check if games already exist
    const snapshot = await getDocs(gamesRef);
    if (!snapshot.empty) {
        console.log(`Firestore already has ${snapshot.size} games. Skipping seed.`);
        return;
    }

    console.log(`Seeding ${gamesData.length} games to Firestore...`);

    for (const game of gamesData) {
        try {
            await setDoc(doc(gamesRef, game.id), {
                ...game,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            console.log(`  ✓ Seeded: ${game.title}`);
        } catch (error) {
            console.error(`  ✗ Error seeding ${game.title}:`, error);
        }
    }

    console.log('Seed complete!');
};

export const fetchGamesFromFirestore = async () => {
    try {
        const gamesRef = collection(db, 'games');
        const snapshot = await getDocs(gamesRef);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching games from Firestore:', error);
        // Fallback to local data
        return gamesData;
    }
};
