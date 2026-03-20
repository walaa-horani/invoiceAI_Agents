const fs = require('fs');
const https = require('https');

const files = [
  { name: 'invoices.html', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzFlOTIxMDIwNDA2MDQyZjA4NDA1OWIzMDljYTJlNTI0EgsSBxDR9Yby4RkYAZIBIwoKcHJvamVjdF9pZBIVQhM1ODYyNjE1Nzg3OTQwNzc2MjMy&filename=&opi=89354086' },
  { name: 'dashboard.html', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAzZDNmNDhmMGYzMzQ4NmZhYmRlZjMzZGRmMmUyNWM4EgsSBxDR9Yby4RkYAZIBIwoKcHJvamVjdF9pZBIVQhM1ODYyNjE1Nzg3OTQwNzc2MjMy&filename=&opi=89354086' },
  { name: 'settings.html', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2NiNzE4ODdjZDhiMDQyYzk5NTE3OWEyOGU2Y2E1YWFkEgsSBxDR9Yby4RkYAZIBIwoKcHJvamVjdF9pZBIVQhM1ODYyNjE1Nzg3OTQwNzc2MjMy&filename=&opi=89354086' },
  { name: 'invoice_detail.html', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzEyNDM0YjM2ZWMxZjRiZGE4YzU2NTc4NjZlMzNlOTlkEgsSBxDR9Yby4RkYAZIBIwoKcHJvamVjdF9pZBIVQhM1ODYyNjE1Nzg3OTQwNzc2MjMy&filename=&opi=89354086' },
  { name: 'create_invoice.html', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzc0YTUyOTRkYWVmMTQ0YWY4OWEyMDJmOTY4OTc0YjA0EgsSBxDR9Yby4RkYAZIBIwoKcHJvamVjdF9pZBIVQhM1ODYyNjE1Nzg3OTQwNzc2MjMy&filename=&opi=89354086' },
  { name: 'clients.html', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzg3MjNmNDMyNTcyMzQxNmViZjdlMmQ3MzVjYmQyMTk5EgsSBxDR9Yby4RkYAZIBIwoKcHJvamVjdF9pZBIVQhM1ODYyNjE1Nzg3OTQwNzc2MjMy&filename=&opi=89354086' }
];

files.forEach(file => {
  https.get(file.url, (res) => {
    const stream = fs.createWriteStream(file.name);
    res.pipe(stream);
    stream.on('finish', () => console.log(`Downloaded ${file.name}`));
  });
});
