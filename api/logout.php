<?php
/**
 * POST /api/logout.php — Encerra a sessão.
 */

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';

cors_headers();
session_start();
require_method('POST');

// Limpa os dados da sessão.
$_SESSION = [];

// Remove o cookie de sessão, se houver.
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        [
            'expires'  => time() - 42000,
            'path'     => $params['path'],
            'domain'   => $params['domain'],
            'secure'   => $params['secure'],
            'httponly' => $params['httponly'],
            'samesite' => $params['samesite'] ?? '',
        ]
    );
}

session_destroy();

respond_success([], 200);
