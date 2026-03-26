#!/usr/bin/env node

/**
 * Script de récupération des flux RSS francophones
 * Génère data/articles.json avec les derniers articles
 */

const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');

const parser = new Parser({
    timeout: 8000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    },
    customFields: {
        item: [
            ['media:content', 'media:content']
        ]
    }
});

// Chemins
const sourcesPath = path.join(__dirname, '../data/sources.json');
const outputPath = path.join(__dirname, '../data/articles.json');

/**
 * Récupère les articles d'une source RSS
 */
async function fetchFeed(source) {
    try {
        console.log(`📡 Fetch: ${source.name}...`);
        const feed = await parser.parseURL(source.url);
        
        const articles = (feed.items || [])
            .filter(item => item.link && item.title)  // Filtrer items invalides
            .slice(0, 15)  // Limiter à 15 articles par source
            .map(item => {
                // Extrait image de plusieurs sources
                let image = null;
                if (item.enclosures?.[0]?.url) image = item.enclosures[0].url;
                else if (item.media?.content?.[0]?.url) image = item.media.content[0].url;
                else if (item['media:content']?.[0]?.url) image = item['media:content'][0].url;
                else image = extractImageFromHtml(item.content);

                return {
                    id: item.guid || item.link,
                    title: (item.title || '').substring(0, 200),
                    excerpt: (item.contentSnippet || item.description || '').substring(0, 300),
                    source: source.name,
                    image: sanitizeUrl(image),
                    link: sanitizeUrl(item.link) || item.link,
                    pubDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
                    country: source.country,
                    tags: extractTags(item.title)
                };
            })
            .filter(article => article.link);

        console.log(`  ✅ ${articles.length} articles`);
        return articles;

    } catch (error) {
        console.error(`  ❌ Erreur: ${error.message}`);
        return [];
    }
}

/**
 * Extrait les tags d'un titre
 */
function extractTags(title) {
    const keywords = [
        'IA', 'AI', 'intelligence artificielle', 'ChatGPT', 'GPT', 'machine learning',
        'deep learning', 'neural', 'transformer', 'LLM', 'générative', 'generative',
        'données', 'data', 'algorithme', 'réseau', 'technologie', 'tech'
    ];

    return keywords
        .filter(kw => title.toLowerCase().includes(kw.toLowerCase()))
        .slice(0, 5);
}

/**
 * Extrait une image du HTML
 */
function extractImageFromHtml(html) {
    if (!html) return null;
    const match = html.match(/<img[^>]+src="([^">]+)"/i);
    return match ? match[1] : null;
}

/**
 * Valide et échappe les URLs
 */
function sanitizeUrl(url) {
    if (!url) return null;
    try {
        new URL(url);
        return url;
    } catch {
        return null;
    }
}

/**
 * Fonction principale
 */
async function main() {
    try {
        console.log('🚀 Démarrage synchronisation flux RSS...\n');

        // Charger sources
        const sourcesJson = fs.readFileSync(sourcesPath, 'utf-8');
        const { sources } = JSON.parse(sourcesJson);

        // Récupérer tous les articles en parallèle
        const results = await Promise.allSettled(
            sources.map(source => fetchFeed(source))
        );

        // Combiner les résultats
        let allArticles = [];
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                allArticles = allArticles.concat(result.value);
            } else {
                console.warn(`⚠️ Erreur source ${index}: ${result.reason}`);
            }
        });

        // Trier par date décroissante
        allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        // Limiter à 500 articles max
        allArticles = allArticles.slice(0, 500);

        // Sauvegarder
        fs.writeFileSync(
            outputPath,
            JSON.stringify({ articles: allArticles, lastUpdate: new Date().toISOString() }, null, 2)
        );

        console.log(`\n✅ Synchronisation terminée!`);
        console.log(`   📊 ${allArticles.length} articles agrégés`);
        console.log(`   💾 Sauvegardé: ${outputPath}`);
        console.log(`   🕐 ${new Date().toLocaleString('fr-FR')}`);

        process.exit(0);

    } catch (error) {
        console.error('\n❌ Erreur:', error.message);
        process.exit(1);
    }
}

main();
