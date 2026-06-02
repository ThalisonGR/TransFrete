<?php
/**
 * GET /api/gemini.php?origem=...&destino=...
 * Dicas de rota segura via Google Gemini (cURL).
 */

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/config.php';

cors_headers();
session_start();

require_auth();

$origem  = trim((string) filter_input(INPUT_GET, 'origem', FILTER_UNSAFE_RAW));
$destino = trim((string) filter_input(INPUT_GET, 'destino', FILTER_UNSAFE_RAW));

$fields = [];
if ($origem === '') {
    $fields['origem'] = 'Informe a origem.';
}
if ($destino === '') {
    $fields['destino'] = 'Informe o destino.';
}
if (!empty($fields)) {
    respond_error('VALIDATION_ERROR', 'Origem e destino são obrigatórios.', 400, $fields);
}

if (GEMINI_API_KEY === '') {
    respond_error(
        'INTERNAL_ERROR',
        'O serviço de IA não está configurado (GEMINI_API_KEY ausente).',
        500
    );
}

$prompt = sprintf(
    'Você é um especialista em logística rodoviária no Brasil. Forneça dicas '
    . 'práticas de rota segura, pontos de atenção, paradas recomendadas e '
    . 'cuidados de segurança para um caminhoneiro que vai transportar carga de '
    . '"%s" até "%s". Responda em português, de forma objetiva, em tópicos curtos.',
    $origem,
    $destino
);

$payload = [
    'contents' => [
        [
            'parts' => [
                ['text' => $prompt],
            ],
        ],
    ],
];

$model = 'gemini-1.5-flash';
$url = sprintf(
    'https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s',
    $model,
    urlencode(GEMINI_API_KEY)
);

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS     => json_encode($payload, JSON_UNESCAPED_UNICODE),
    CURLOPT_TIMEOUT        => 30,
]);

$response = curl_exec($ch);
$httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr  = curl_error($ch);
curl_close($ch);

if ($response === false || $curlErr !== '') {
    respond_error('INTERNAL_ERROR', 'Falha ao contatar o serviço de IA.', 500);
}

if ($httpCode < 200 || $httpCode >= 300) {
    respond_error('INTERNAL_ERROR', 'O serviço de IA retornou um erro.', 500);
}

$decoded = json_decode($response, true);
$dicas = $decoded['candidates'][0]['content']['parts'][0]['text'] ?? null;

if (!is_string($dicas) || trim($dicas) === '') {
    respond_error('INTERNAL_ERROR', 'Não foi possível gerar as dicas no momento.', 500);
}

respond_success(['dicas' => $dicas], 200);
