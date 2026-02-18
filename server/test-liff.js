// Node 18+ has global fetch

async function test() {
    try {
        const response = await fetch('http://localhost:3000/api/attendees/liff', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                meetingId: '1', // Ensure meeting ID 1 exists
                lineUserId: 'Utest123456',
                name: 'Test Automatic User',
                position: 'Tester',
                pictureUrl: 'https://example.com/pic.jpg'
            })
        });
        const data = await response.json();
        console.log('Response:', data);
    } catch (e) {
        console.error('Error:', e);
    }
}
test();
