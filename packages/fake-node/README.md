import { NodeUrlFetchApp } from "@gasboost/fake-node";

const UrlFetchApp = new NodeUrlFetchApp();

const response = UrlFetchApp.fetch("https://example.com", {
method: "post",
contentType: "application/json",
payload: JSON.stringify({
message: "hello",
}),
});

console.log(response.getResponseCode());
console.log(response.getContentText());
