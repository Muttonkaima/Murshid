const fs = require('fs');
const path = require('path');

// Helper function to add image field to an object if it has read_text and hide_text
function addImageFieldIfNeeded(obj) {
  if (obj && 
      'read_text' in obj && 
      'hide_text' in obj && 
      !('image' in obj)) {
    obj.image = "";
    return true;
  }
  return false;
}

// Function to process a single JSON file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    let modified = false;
    
    // Check if the file has a questions array
    if (data.questions && Array.isArray(data.questions)) {
      data.questions.forEach(question => {
        // Process question object
        if (question.question) {
          if (addImageFieldIfNeeded(question.question)) {
            modified = true;
          }
        }
        
        // Process options array (for MCQ and multi-select)
        if (question.options && Array.isArray(question.options)) {
          question.options.forEach(option => {
            if (addImageFieldIfNeeded(option)) {
              modified = true;
            }
          });
        }
        
        // Process leftItems and rightItems (for match-the-following)
        ['leftItems', 'rightItems'].forEach(key => {
          if (question[key] && Array.isArray(question[key])) {
            question[key].forEach(item => {
              if (addImageFieldIfNeeded(item)) {
                modified = true;
              }
            });
          }
        });
        
        // Process items array (for reordering and sorting)
        if (question.items && Array.isArray(question.items)) {
          question.items.forEach(item => {
            if (addImageFieldIfNeeded(item)) {
              modified = true;
            }
          });
        }
        
        // Process categories array (for sorting questions)
        if (question.categories && Array.isArray(question.categories)) {
          question.categories.forEach(category => {
            if (addImageFieldIfNeeded(category)) {
              modified = true;
            }
          });
        }
      });
      
      // Write back to file if modified
      if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`Updated: ${filePath}`);
        return true;
      } else {
        console.log(`No changes needed: ${filePath}`);
        return false;
      }
    }
    
    console.log(`Skipped (no questions array): ${filePath}`);
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Function to find all JSON files in a directory recursively
function getJsonFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other unwanted directories
      if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(file)) {
        getJsonFiles(filePath, fileList);
      }
    } else if (file.endsWith('.json') && !file.endsWith('subjects.json')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Main function
function main() {
  const targetDir = path.join(__dirname, 'src', 'data');
  const jsonFiles = getJsonFiles(targetDir);
  
  console.log(`Found ${jsonFiles.length} JSON files to process`);
  
  let updatedCount = 0;
  
  jsonFiles.forEach(file => {
    if (processFile(file)) {
      updatedCount++;
    }
  });
  
  console.log(`\nProcessing complete. Updated ${updatedCount} out of ${jsonFiles.length} files.`);
}

// Run the script
main();
