#!/usr/bin/env python3
"""
Import Standardization Script for CloudCostIQ

This script helps to standardize import patterns in Python files according to 
the project's style guide. It organizes imports into standard groups:
1. Standard library imports
2. Third-party imports
3. Local imports

It also converts relative imports to absolute imports.

Usage:
    python standardize_imports.py [directory]

Example:
    python standardize_imports.py backend/ai/
"""

import os
import re
import sys
import ast
from typing import List, Dict, Tuple, Set

# Standard library modules (incomplete - extend as needed)
STDLIB_MODULES = {
    "abc", "argparse", "asyncio", "collections", "concurrent", "contextlib", 
    "copy", "csv", "datetime", "decimal", "enum", "functools", "glob", 
    "hashlib", "importlib", "inspect", "io", "json", "logging", "math", 
    "multiprocessing", "os", "pathlib", "pickle", "random", "re", "shutil", 
    "sqlite3", "string", "sys", "tempfile", "threading", "time", "timeit", 
    "traceback", "typing", "unittest", "uuid", "warnings", "zipfile"
}

# Third-party modules used in the project (extend as needed)
THIRD_PARTY_MODULES = {
    "numpy", "pandas", "sklearn", "fastapi", "sqlalchemy", "pydantic", 
    "statsmodels", "prophet", "scipy", "boto3", "azure", "google"
}

# Modules defined in this project (extend as needed)
PROJECT_MODULES = {
    "backend.ai", "backend.api", "backend.database", "backend.models", 
    "backend.services", "backend.utils", "backend.config", "backend.auth"
}


def parse_imports(file_content: str) -> Tuple[List[str], Dict[str, List[str]]]:
    """
    Parse import statements from file content.
    
    Returns:
        Tuple containing:
        - List of raw import statements as they appear in the file
        - Dictionary mapping each import statement to its classification:
          'stdlib', 'third_party', 'project', 'relative'
    """
    # Regular expressions for imports
    import_pattern = re.compile(r'^(?:from\s+\S+\s+)?import\s+.+', re.MULTILINE)
    
    # Find all import statements
    imports = import_pattern.findall(file_content)
    
    # Classify imports
    import_types = {}
    
    for imp in imports:
        # Try to determine import type
        if imp.startswith('from .'):
            import_types[imp] = 'relative'
        elif any(imp.startswith(f"from {mod}") or imp.startswith(f"import {mod}") 
                for mod in STDLIB_MODULES):
            import_types[imp] = 'stdlib'
        elif any(imp.startswith(f"from {mod}") or imp.startswith(f"import {mod}") 
                for mod in THIRD_PARTY_MODULES):
            import_types[imp] = 'third_party'
        elif any(imp.startswith(f"from {mod}") or imp.startswith(f"import {mod}") 
                for mod in PROJECT_MODULES):
            import_types[imp] = 'project'
        else:
            # If unsure, try to infer from the module name
            module_name = re.search(r'^(?:from\s+(\S+)|import\s+(\S+))', imp).group(1) or \
                          re.search(r'^(?:from\s+(\S+)|import\s+(\S+))', imp).group(2)
            module_name = module_name.split('.')[0]
            
            if module_name in STDLIB_MODULES:
                import_types[imp] = 'stdlib'
            elif module_name in THIRD_PARTY_MODULES:
                import_types[imp] = 'third_party'
            elif module_name.startswith('backend'):
                import_types[imp] = 'project'
            else:
                # Default to third_party if unknown
                import_types[imp] = 'third_party'
    
    return imports, import_types


def convert_relative_to_absolute(rel_import: str, current_module_path: str) -> str:
    """
    Convert a relative import to an absolute import.
    
    Args:
        rel_import: The relative import statement
        current_module_path: The module path of the current file
        
    Returns:
        The converted absolute import statement
    """
    # Extract the relative part and the imported name
    match = re.match(r'from\s+(\.+)(\S*)\s+import\s+(.+)', rel_import)
    if not match:
        return rel_import
        
    dots, rel_module, imported = match.groups()
    
    # Split the current module path
    module_parts = current_module_path.split('.')
    
    # Calculate the target module based on relative dots
    if dots:
        # Go up in the hierarchy based on the number of dots
        levels_up = len(dots)
        if levels_up >= len(module_parts):
            print(f"Warning: Cannot resolve relative import: {rel_import}")
            return rel_import
            
        base_module = '.'.join(module_parts[:-levels_up])
        
        # Reconstruct the absolute import
        if rel_module:
            target_module = f"{base_module}.{rel_module}"
        else:
            target_module = base_module
            
        return f"from {target_module} import {imported}"
    
    return rel_import


def group_imports(imports: List[str], import_types: Dict[str, str], 
                 current_module_path: str) -> Dict[str, List[str]]:
    """
    Group imports by type and convert relative imports.
    
    Args:
        imports: List of import statements
        import_types: Dictionary mapping import statements to their types
        current_module_path: The module path of the current file
        
    Returns:
        Dictionary with imports grouped by type
    """
    grouped = {
        'stdlib': [],
        'third_party': [],
        'project': []
    }
    
    for imp in imports:
        imp_type = import_types[imp]
        
        # Convert relative imports to absolute
        if imp_type == 'relative':
            converted = convert_relative_to_absolute(imp, current_module_path)
            # Re-evaluate the type after conversion
            if 'backend.' in converted:
                grouped['project'].append(converted)
            else:
                # If conversion failed or it's not a project import, default to third-party
                grouped['third_party'].append(converted)
        else:
            grouped[imp_type].append(imp)
    
    return grouped


def format_grouped_imports(grouped_imports: Dict[str, List[str]]) -> str:
    """
    Format the grouped imports into a standardized string.
    
    Args:
        grouped_imports: Dictionary with imports grouped by type
        
    Returns:
        Formatted import section as a string
    """
    result = []
    
    # Add standard library imports
    if grouped_imports['stdlib']:
        result.append("# Standard library imports")
        result.extend(sorted(grouped_imports['stdlib']))
        result.append("")
    
    # Add third-party imports
    if grouped_imports['third_party']:
        result.append("# Third-party imports")
        result.extend(sorted(grouped_imports['third_party']))
        result.append("")
    
    # Add project imports
    if grouped_imports['project']:
        result.append("# Local imports")
        result.extend(sorted(grouped_imports['project']))
        result.append("")
    
    return "\n".join(result)


def process_file(file_path: str) -> Tuple[bool, str]:
    """
    Process a Python file to standardize imports.
    
    Args:
        file_path: Path to the Python file
        
    Returns:
        Tuple containing:
        - Boolean indicating whether changes were made
        - Message with details about the process
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract the module path from the file path
        rel_path = os.path.relpath(file_path).replace('/', '.').replace('\\', '.')
        if rel_path.endswith('.py'):
            rel_path = rel_path[:-3]
        
        # Parse imports
        imports, import_types = parse_imports(content)
        
        # Skip if no imports found
        if not imports:
            return False, f"No imports found in {file_path}"
        
        # Extract the current content without the imports
        content_without_imports = content
        for imp in imports:
            content_without_imports = content_without_imports.replace(imp, '')
        
        # Group imports and convert relative imports
        grouped = group_imports(imports, import_types, rel_path)
        
        # Format the new import section
        new_imports = format_grouped_imports(grouped)
        
        # Find where to insert the new imports
        # Look for module docstring first
        docstring_match = re.search(r'^""".*?"""', content, re.DOTALL)
        if docstring_match:
            insert_point = docstring_match.end()
            # Add another newline if there isn't one already
            if not content[insert_point:insert_point+2].isspace():
                new_imports = "\n\n" + new_imports
            else:
                new_imports = "\n" + new_imports
        else:
            # If no docstring, insert at the beginning
            insert_point = 0
        
        # Rebuild the content
        new_content = content[:insert_point] + new_imports + content_without_imports[insert_point:]
        
        # Clean up multiple blank lines
        new_content = re.sub(r'\n{3,}', '\n\n', new_content)
        
        # Skip if no changes
        if new_content == content:
            return False, f"No changes made to {file_path}"
        
        # Write the changes
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
            
        return True, f"Standardized imports in {file_path}"
        
    except Exception as e:
        return False, f"Error processing {file_path}: {str(e)}"


def process_directory(directory: str) -> None:
    """
    Process all Python files in a directory to standardize imports.
    
    Args:
        directory: Directory to process
    """
    changed_files = 0
    processed_files = 0
    
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                processed_files += 1
                
                changed, message = process_file(file_path)
                if changed:
                    changed_files += 1
                    print(f"✅ {message}")
                else:
                    print(f"ℹ️ {message}")
    
    print(f"\nProcessed {processed_files} files, standardized imports in {changed_files} files.")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please provide a directory to process")
        print(f"Usage: {sys.argv[0]} <directory>")
        sys.exit(1)
        
    directory = sys.argv[1]
    if not os.path.isdir(directory):
        print(f"Error: {directory} is not a valid directory")
        sys.exit(1)
        
    print(f"Standardizing imports in {directory}...")
    process_directory(directory)