<?php
/**
 * GET /api/me.php — Retorna o usuário logado (reidratação de sessão).
 */

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';

cors_headers();
session_start();

$user = require_auth();

respond_success(['usuario' => $user], 200);
