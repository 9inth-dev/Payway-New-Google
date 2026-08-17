// Official PayWay Developer Documentation URLs
export const PAYWAY_DEVELOPER_SITE_URL = 'https://developer.payway.com.kh/';
export const QR_API_DOCUMENTATION_URL = 'https://developer.payway.com.kh/';

// PayWay QR API Standard Endpoint & Integration Constants
export const CURRENT_GENERATE_QR_ENDPOINT = '/api/v1/purchase/create_qr';
export const CHECK_TRANSACTION_ENDPOINT = '/api/v1/purchase/check_transaction';
export const SUPPORTED_PAYWAY_CURRENCIES: ('USD' | 'KHR')[] = ['USD', 'KHR'];
export const SUPPORTED_QR_IMAGE_TEMPLATE = 'template_standard_khqr';

export interface SampleCodeDefinition {
  id: 'curl' | 'javascript' | 'php' | 'python';
  label: string;
  languageName: string;
  snippet: (context: { merchantId: string; apiKey: string; reqTime: string; tranId: string }) => string;
}

export interface ProductResourceDefinition {
  productId: string;
  productName: string;
  title: string;
  description: string;
  documentationUrl: string;
  samples: SampleCodeDefinition[];
}

export const QR_API_SAMPLE_LANGUAGES: SampleCodeDefinition[] = [
  {
    id: 'curl',
    label: 'cURL',
    languageName: 'Bash / cURL',
    snippet: ({ merchantId, reqTime, tranId }) => `curl -X POST "https://checkout-sandbox.payway.com.kh/api/v1/purchase/create_qr" \\
  -H "Content-Type: application/json" \\
  -d '{
    "req_time": "${reqTime}",
    "merchant_id": "${merchantId}",
    "tran_id": "${tranId}",
    "amount": "10.00",
    "currency": "USD",
    "hash": "YOUR_CALCULATED_HMAC_SHA512_HASH"
  }'`,
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    languageName: 'Node.js',
    snippet: ({ merchantId, apiKey, reqTime, tranId }) => `const crypto = require('crypto');
const axios = require('axios');

const apiKey = "${apiKey}";
const merchantId = "${merchantId}";
const reqTime = "${reqTime}";
const tranId = "${tranId}";
const amount = "10.00";

// Calculate HMAC-SHA512 hash using your API Key
const rawData = reqTime + merchantId + tranId + amount;
const hash = crypto.createHmac('sha512', apiKey).update(rawData).digest('base64');

axios.post('https://checkout-sandbox.payway.com.kh/api/v1/purchase/create_qr', {
  req_time: reqTime,
  merchant_id: merchantId,
  tran_id: tranId,
  amount: amount,
  hash: hash
})
.then(response => console.log('QR Response:', response.data))
.catch(error => console.error('Error creating QR:', error));`,
  },
  {
    id: 'php',
    label: 'PHP',
    languageName: 'PHP 7.4+',
    snippet: ({ merchantId, apiKey, reqTime, tranId }) => `<?php
$apiKey = "${apiKey}";
$merchantId = "${merchantId}";
$reqTime = "${reqTime}";
$tranId = "${tranId}";
$amount = "10.00";

// Calculate HMAC-SHA512 hash
$rawStr = $reqTime . $merchantId . $tranId . $amount;
$hash = base64_encode(hash_hmac("sha512", $rawStr, $apiKey, true));

$payload = [
  "req_time"    => $reqTime,
  "merchant_id" => $merchantId,
  "tran_id"     => $tranId,
  "amount"      => $amount,
  "hash"        => $hash
];

$ch = curl_init("https://checkout-sandbox.payway.com.kh/api/v1/purchase/create_qr");
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>`,
  },
  {
    id: 'python',
    label: 'Python',
    languageName: 'Python 3',
    snippet: ({ merchantId, apiKey, reqTime, tranId }) => `import hmac
import hashlib
import base64
import requests

api_key = "${apiKey}".encode('utf-8')
merchant_id = "${merchantId}"
req_time = "${reqTime}"
tran_id = "${tranId}"
amount = "10.00"

# Calculate HMAC-SHA512 signature
raw_str = f"{req_time}{merchant_id}{tran_id}{amount}".encode('utf-8')
hash_sig = base64.b64encode(hmac.new(api_key, raw_str, hashlib.sha512).digest()).decode('utf-8')

response = requests.post(
    "https://checkout-sandbox.payway.com.kh/api/v1/purchase/create_qr",
    json={
        "req_time": req_time,
        "merchant_id": merchant_id,
        "tran_id": tran_id,
        "amount": amount,
        "hash": hash_sig
    }
)

print("QR Response:", response.json())`,
  },
];

// Product developer resources catalogue designed for future products (e.g. Card, Checkout, etc.)
export const PRODUCT_DEVELOPER_RESOURCES: Record<string, ProductResourceDefinition> = {
  qrApi: {
    productId: 'qr-api',
    productName: 'QR API',
    title: 'QR API Documentation',
    description: 'Learn how to generate QR payments, handle payment results and confirm transaction status.',
    documentationUrl: QR_API_DOCUMENTATION_URL,
    samples: QR_API_SAMPLE_LANGUAGES,
  },
};
