export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const n8nWebhookUrl = 'https://https://portfoliohighgency.app.n8n.cloud/webhook/4a1614a7-25d5-461b-afbf-4e504720d70d
';

  try {
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur n8n (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Erreur API submit:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
