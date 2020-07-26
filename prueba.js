
const fetch = require("node-fetch");
const { parse } = require('node-html-parser');




// const getTextFrom

const sendRequest = async () => {

    const result = await fetch('https://google.com');
    const text = await result.text();
    console.log(text);
    // const root = parse(text);
    // console.log(root.querySelector('div'))
};

	sendRequest();

// fetch('https://google.com')
//   .then(response => response.text())
//   .then(body => console.log(body));