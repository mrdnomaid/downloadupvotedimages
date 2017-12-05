const s = require("./settings.json");
const fs = require('fs');
const request = require('request');

function sww(message) {
    console.log(`\/!\\ Something went wrong:\n${message}`);
    process.exit(1);
}

if (s.redditusername.length < 2 || s.redditusername.length > 21 || !s.redditusername) {
    sww('Invalid reddit username specified - check settings.json!');
}

// if (s.downloadpath.charAt(s.downloadpath.toString().length - 1) !== '/' || s.downloadpath.charAt(s.downloadpath.toString().length - 1) !== '\\') {
//   sww('Make sure to add a trailing slash to your download path!');
// }

let url = `https://www.reddit.com/user/${s.redditusername}/upvoted.json?limit=100`;
let options = {
    url: url,
    method: 'GET'
};

request(options, function(err, r, data) {
    if (!err && r.statusCode == 200) {
        data = JSON.parse(data);
        let posts = data.data.children;
        let pcount = posts.length;
        console.log(`Found ${pcount} posts!\n`);

        for (let i = 0; i < pcount; i++) {
            let selfcontent = '';

            // If it's a self post, make sure that downloading self posts is enabled before downloading.
            // TODO: fix this
            // if (posts[i].data.is_self && s.includeself == true) {
            //   selfcontent = `
            //     <html>
            //     <head>
            //     <meta charset="utf-8">
            //     <title>${posts[i].data.title}</title>
            //     </head>
            //     <body>
            //     <h3>${posts[i].data.permalink}</h3>
            //     <h1>${posts[i].data.title}<h1>
            //     <h3>Posted by <a href="https://reddit.com/u/${posts[i].data.author}">${posts[i].data.author}</a></h3>
            //     <h3>${posts[i].data.score} upvotes<h3>
            //     <hr>
            //     ${posts[i].data.selftext}
            //     </body>
            //     </html>
            //   `
            //   fs.writeFile(`${s.downloadpath}${po  sts[i].data.id}-${posts[i].data.title.replace(/[^A-Za-z0-9 ]/g,'')}.html`, selfcontent);
            // }

            // Link posts, geared towards images
            if (posts[i].data.url) {
                console.log(`Downloading "${posts[i].data.url}" from reddit post ${posts[i].data.id}`);
                if (!(/\.(gif|jpg|jpeg|tiff|png)$/i).test(posts[i].data.url)) {
                    console.log(`[i] Info: ${posts[i].data.id} is not an image: skipping!\n`);
                } else {

                let filename = `${posts[i].data.url.replace('//','').split('/')[1]}`;


                if (!fs.existsSync(`${s.downloadpath}${posts[i].data.subreddit}`)) {
                    fs.mkdirSync(`${s.downloadpath}${posts[i].data.subreddit}`);
                }

                request(posts[i].data.url).pipe(fs.createWriteStream(`${s.downloadpath}${posts[i].data.subreddit}/${posts[i].data.id}-${posts[i].data.title.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '')}-${filename}`));
                console.log(`Downloaded ${posts[i].data.id}!\n`);
              }
            }

            if (i + 1 == pcount) {
                console.log(`\n\nDownloaded all ${pcount} posts!`);
            }
        }

    } else {
        sww(`There was an contacting reddit - response: ${r.statusCode}. Check your connection and make sure that your upvotes are public!`);
    }
});
