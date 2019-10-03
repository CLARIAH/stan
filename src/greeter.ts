function greeter(person: string) {
    return "Hello, " + person;
}

let user = "Jane User";

var p = new Promise<string>((resolve, reject) => {
    resolve('a string');
});

document.body.textContent = greeter(user);
