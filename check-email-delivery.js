// Try to check email delivery status via EmailIt API
import https from 'https';

const apiKey = 'secret_1sjFHygScUBcZ5foQXL2CNDU2FKNmjUr';

const options = {
  hostname: 'api.emailit.com',
  path: '/v2/emails?limit=10',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
};

console.log('🔍 Checking EmailIt API for recent emails...\n');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('📊 EmailIt API Response:');
      console.log(JSON.stringify(result, null, 2));
      
      if (result.data && result.data.length > 0) {
        console.log('\n✅ Found recent emails in EmailIt!');
        const recentEmails = result.data.filter(email => 
          email.to && email.to.includes('forato+ralph00okiuj@gmail.com')
        );
        if (recentEmails.length > 0) {
          console.log('📧 Emails sent to forato+ralph00okiuj@gmail.com:');
          recentEmails.forEach(email => {
            console.log(`   - Subject: ${email.subject}`);
            console.log(`   - Status: ${email.status}`);
            console.log(`   - Created: ${email.created_at}\n`);
          });
        }
      }
    } catch (e) {
      console.log('❌ Error parsing response:', e.message);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ API Error:', error.message);
});

req.end();
