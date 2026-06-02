<?php
/**
 * config.php — Carregamento de credenciais do TransFrete.
 *
 * As variáveis podem vir de:
 *   1. Ambiente real (getenv) — recomendado em produção.
 *   2. Um arquivo .env na raiz do projeto (KEY=VALUE por linha).
 *   3. Os valores padrão (fallback) abaixo — úteis em dev local com XAMPP.
 *
 * Nunca versione credenciais reais. Use .env (copiado de .env.example).
 */

declare(strict_types=1);

/**
 * Carrega um arquivo .env simples (KEY=VALUE) para o ambiente, caso exista.
 * Não sobrescreve variáveis já presentes em getenv().
 */
function transfrete_load_env(string $path): void
{
    if (!is_file($path) || !is_readable($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return;
    }

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') {
            continue;
        }
        $pos = strpos($line, '=');
        if ($pos === false) {
            continue;
        }
        $key = trim(substr($line, 0, $pos));
        $val = trim(substr($line, $pos + 1));

        // Remove aspas envolventes, se houver.
        if (strlen($val) >= 2) {
            $first = $val[0];
            $last = $val[strlen($val) - 1];
            if (($first === '"' && $last === '"') || ($first === "'" && $last === "'")) {
                $val = substr($val, 1, -1);
            }
        }

        if ($key !== '' && getenv($key) === false) {
            putenv("$key=$val");
            $_ENV[$key] = $val;
        }
    }
}

// Tenta carregar o .env da raiz do projeto (um nível acima de /api).
transfrete_load_env(dirname(__DIR__) . DIRECTORY_SEPARATOR . '.env');

/**
 * Lê uma configuração do ambiente com valor padrão (fallback).
 */
function config(string $key, string $default = ''): string
{
    $val = getenv($key);
    if ($val === false || $val === '') {
        return $default;
    }
    return $val;
}

// --- Credenciais do banco de dados (fallback para dev local XAMPP) ---
define('DB_HOST', config('DB_HOST', '127.0.0.1'));
define('DB_NAME', config('DB_NAME', 'transfrete'));
define('DB_USER', config('DB_USER', 'root'));
define('DB_PASS', config('DB_PASS', ''));

// --- Chave da API do Google Gemini ---
define('GEMINI_API_KEY', config('GEMINI_API_KEY', ''));
