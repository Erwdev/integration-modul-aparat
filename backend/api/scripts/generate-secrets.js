const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const outputFlagIndex = args.indexOf('-o');
const outputFile = outputFlagIndex !== -1 ? args[outputFlagIndex + 1] : null;

// Generate secrets
const secrets = {
  JWT_SECRET: crypto.randomBytes(32).toString('hex'),
  JWT_REFRESH_SECRET: crypto.randomBytes(32).toString('hex'),
  API_KEY: crypto.randomBytes(32).toString('base64'),
  API_KEY_AGENDA: crypto.randomBytes(32).toString('base64'),
  API_KEY_EKSPEDISI: crypto.randomBytes(32).toString('base64'),
  API_KEY_SURAT: crypto.randomBytes(32).toString('base64'),
};

// Format output
const timestamp = new Date().toISOString();
let output = `# Generated Secrets - ${timestamp}\n`;
output += `# KEEP THIS FILE SECURE! Do not commit to version control.\n\n`;

for (const [key, value] of Object.entries(secrets)) {
  output += `${key}=${value}\n`;
}

// Output to console
console.log('🔐 Generated Secure Secrets:\n');
console.log(output);

// Output to file if -o flag is provided
if (outputFile) {
  const outputPath = path.resolve(process.cwd(), outputFile);
  
  try {
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write to file
    fs.writeFileSync(outputPath, output, 'utf8');
    console.log(`✅ Secrets saved to: ${outputPath}`);
    console.log(`⚠️  Remember to add "${outputFile}" to .gitignore!`);
  } catch (error) {
    console.error(`❌ Error writing to file: ${error.message}`);
    process.exit(1);
  }
} else {
  console.log('💡 Tip: Use -o flag to save to file (e.g., node generate-secrets.js -o secrets.txt)');
}