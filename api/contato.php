<?php
/**
 * POST /api/contato.php — Fale Conosco. Mensagem > 20 caracteres.
 */

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';

cors_headers();
session_start();
require_method('POST');

$body = read_json_body();

$nome     = trim((string) ($body['nome'] ?? ''));
$email    = trim((string) ($body['email'] ?? ''));
$mensagem = trim((string) ($body['mensagem'] ?? ''));

$fields = [];
if ($nome === '') {
    $fields['nome'] = 'Informe seu nome.';
}
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $fields['email'] = 'Informe um email válido.';
}
if (mb_strlen($mensagem) <= 20) {
    $fields['mensagem'] = 'A mensagem deve ter mais de 20 caracteres.';
}
if (!empty($fields)) {
    respond_error('VALIDATION_ERROR', 'Dados de contato inválidos.', 400, $fields);
}

// Envio de e-mail via mail() do PHP. Em dev (sem MTA) a falha é silenciada
// para não quebrar o fluxo do frontend.
$destino = 'contato@transfrete.local';
$assunto = 'Fale Conosco - TransFrete';
$corpo   = "Nome: {$nome}\nEmail: {$email}\n\nMensagem:\n{$mensagem}\n";
$headers = 'From: ' . $email . "\r\n" . 'Reply-To: ' . $email . "\r\n";

@mail($destino, $assunto, $corpo, $headers);

respond_success([], 200);
