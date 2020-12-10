const students = [
    { id: 1, firstName: 'Василий', lastName: 'Иванов', age: 14, weight: 45, height: 160, math: 4, chemistry: 5, physics: 3 },
    { id: 2, firstName: 'Андрей', lastName: 'Петров', age: 15, weight: 55, height: 163, math: 3, chemistry: 3, physics: 3 },
    { id: 3, firstName: 'Семён', lastName: 'Сидоров', age: 14, weight: 62, height: 155, math: 5, chemistry: 5, physics: 5 },
];

const list = students.map( (student) => {
    return student.lastName + ' ' + student.firstName;
});

 // console.log(list);

// console.log(students.length);
// console.log(students[1]);
const age_15 = students.filter( function (student) {
    return student.age === 15;
});

// console.log(age_15);
students.forEach(function (student) {
    student.chem = student.chemistry;
    delete student.chemistry;
});
// console.log(students);

const avgPhysics = students.reduce( function (acum, student) {
    return acum + student.physics;
}, 0)/students.length;

// console.log(avgPhysics);

function func(){
  this.name = 'yura';
};

// console.log(new func());

var fun1 = (function () {
    var city = 'minsk';
    var a = 4;

    return function (){
        console.log(a);
    }
})();
// console.log(fun1());

function createcount() {
    var a = 0;

    return function(){
        a++;
        return a;
    }
};

var count1 = new createcount();
var count2 = createcount();
// console.log(count1());
// console.log(count1());
// console.log(count2());

let a = [1,2,3,4];
let b = a;
b.push(4);
// console.log(a);
// console.log(b);
let c = [1,2,3,4,4];

// console.log(a===c);
//
// console.log(im);
var im;

var user = {};
console.log(user);
user.name = 'jhon';
console.log(user);
user.surname = 'smith';
console.log(user);
user.name = 'pete';
console.log(user);
delete user.name;
console.log(user);

let schedule = {};
// console.log(schedule);
function isEmpty(obj) {
    for(let key in obj){
        return false;
    }
    return true;
}
console.log(isEmpty(schedule));
schedule["8:30"] = "get up";

console.log(isEmpty(schedule));

let salaries = {
    John: 100,
    Ann: 160,
    Pete: 130
}

function summ(object) {
    let sum = 0;
    for (let key in object){
        sum += object[key]
    }
    return sum;
}
console.log(summ(salaries));


let menu = {
    width: 200,
    height: 300,
    title: "My menu"
};
function multiplyNumeric(object) {
    for (let key in object){
        if(typeof object[key] === "number"){
            object[key] *=2;
        }
    }
}
multiplyNumeric(menu);
// console.log(menu);

function createManager() {
    const fw = ['angular', 'express'];

    return {
        print: function () {
            console.log(fw)
        },
        add: function (object) {
            fw.push(object)
        }
    }
}
const manager = createManager();
manager.print();
manager.add('node');
manager.print();


for (var i = 0; i < 5; i++){
    (function(index){
        setTimeout(function () {
          //  console.log(index);
        }, 1000)
    })(i);
}

const restaurant = {
    name: 'two brothers',
    city: 'new york',
    getInfo: function(stars){
        console.log(`the ${this.name} restaurant in ${this.city} have ${stars} stars`);
    }
}

const rest = {name: 'kfc', city: 'kiyv'};

restaurant.getInfo(5);

restaurant.getInfo.call(rest, 4);
restaurant.getInfo.apply(rest, [4]);
// restaurant.getInfo.call(rest, 4);
const f1 = restaurant.getInfo.bind(rest, 4);// bind не вызывает функцию а возвращает новую


console.log('f1, bind')
f1();

//-----------

function Class(name, age) {
    this.name = name;
    const voarst= this.age
    ;
    console.log(this.name)
    console.log(voarst)
}

const human = new Class('bohdan :D', 19);


