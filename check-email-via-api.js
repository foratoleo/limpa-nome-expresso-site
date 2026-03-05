import { ImapSimple } from 'imap-simple';

async function checkEmail() {
  try {
    const connection = await ImapSimple.connect({
      imap: {
        user: 'forato+ralph00okiuj@gmail.com',
        password: '909090',
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        authTimeout: 10000
      }
    });

    // Wait for emails to arrive
    await connection.end();

    console.log('✅ Connected to Gmail IMAP');
    return true;
  } catch (error) {
    console.log('❌ IMAP connection failed:', error.message);
    return false;
  }
}

checkEmail();
