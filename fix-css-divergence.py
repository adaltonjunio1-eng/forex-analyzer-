import re

# Read the file
with open('css/style.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the corrupted section and replace it
corrupted_pattern = r' / \*   R S I.*?@ k e y f r a m e s.*?} \s+}'
replacement = '''/* RSI Divergence Indicator Styles */
#divergenceStatus {
    font-size: 12px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    padding: 4px 8px;
    margin: 2px 0;
    transition: all var(--transition-normal);
    text-align: center;
    min-height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 4px;
}

.divergence-inactive {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-muted);
    border: 1px solid var(--border-color);
}

.divergence-active {
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 150, 255, 0.1));
    border: 1px solid var(--secondary-color);
    animation: divergencePulse 2s ease-in-out infinite;
}

.divergence-active.buy {
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(0, 200, 100, 0.1));
    border-color: var(--success-color);
    color: var(--success-color);
}

.divergence-active.sell {
    background: linear-gradient(135deg, rgba(255, 71, 87, 0.15), rgba(255, 100, 100, 0.1));
    border-color: var(--danger-color);
    color: var(--danger-color);
}

@keyframes divergencePulse {
    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.4); }
    50% { transform: scale(1.02); box-shadow: 0 0 0 4px rgba(0, 255, 136, 0.1); }
}'''

# Replace the corrupted section
content = re.sub(corrupted_pattern, replacement, content, flags=re.DOTALL)

# Write back
with open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ CSS corrigido com sucesso!")
