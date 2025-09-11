const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function validatePage(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        if (lines[0] !== '---') {
            return { valid: false, error: 'Missing frontmatter start' };
        }
        
        const frontmatterEnd = lines.indexOf('---', 1);
        if (frontmatterEnd === -1) {
            return { valid: false, error: 'Missing frontmatter end' };
        }
        
        const frontmatterContent = lines.slice(1, frontmatterEnd).join('\n');
        const metadata = yaml.load(frontmatterContent);
        
        const required = ['title', 'category', 'user-keywords', 'uuid', 'lastModified'];
        const missing = required.filter(field => !metadata.hasOwnProperty(field));
        
        if (missing.length > 0) {
            return { valid: false, error: 'Missing fields: ' + missing.join(', ') };
        }
        
        const validCategories = ['General', 'System', 'Documentation', 'Developer'];
        if (!validCategories.includes(metadata.category)) {
            return { valid: false, error: 'Invalid category: ' + metadata.category };
        }
        
        return { valid: true, metadata };
    } catch (error) {
        return { valid: false, error: error.message };
    }
}

function scanDirectory(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    let results = { valid: 0, invalid: 0, errors: [], categories: {} };
    
    files.forEach(file => {
        if (file.isFile() && file.name.endsWith('.md')) {
            const filePath = path.join(dir, file.name);
            const result = validatePage(filePath);
            
            if (result.valid) {
                results.valid++;
                const category = result.metadata.category;
                results.categories[category] = (results.categories[category] || 0) + 1;
                console.log(`✅ ${file.name} - Category: ${category}`);
            } else {
                results.invalid++;
                results.errors.push({ file: file.name, error: result.error });
                console.log(`❌ ${file.name} - ERROR: ${result.error}`);
            }
        }
    });
    
    return results;
}

console.log('=== FINAL METADATA VALIDATION ===\n');

console.log('📁 pages directory:');
const pagesResults = scanDirectory('pages');

console.log('\n📁 required-pages directory:');
const requiredResults = scanDirectory('required-pages');

const totalValid = pagesResults.valid + requiredResults.valid;
const totalInvalid = pagesResults.invalid + requiredResults.invalid;
const totalFiles = totalValid + totalInvalid;

// Combine categories
const allCategories = { ...pagesResults.categories };
Object.keys(requiredResults.categories).forEach(cat => {
    allCategories[cat] = (allCategories[cat] || 0) + requiredResults.categories[cat];
});

console.log('\n============================================================');
console.log('📊 FINAL METADATA VALIDATION REPORT');
console.log('============================================================');
console.log(`✅ Valid files: ${totalValid}/${totalFiles}`);
console.log(`❌ Invalid files: ${totalInvalid}`);
console.log(`📈 Success rate: ${Math.round((totalValid / totalFiles) * 100)}%`);

console.log('\n📋 Category Distribution:');
Object.entries(allCategories).sort().forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count} files`);
});

if (totalInvalid > 0) {
    console.log('\n🚨 Errors found:');
    [...pagesResults.errors, ...requiredResults.errors].forEach(error => {
        console.log(`   • ${error.file}: ${error.error}`);
    });
} else {
    console.log('\n🎉 ALL FILES PASS VALIDATION!');
    console.log('🏆 Perfect metadata compliance achieved!');
}
