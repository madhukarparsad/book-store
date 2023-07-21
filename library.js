const fs = require('fs');
const input = require('readline-sync');

class Library {
  constructor() {
    this.bookData = {};
    this.userData = {};
  }

  loadData() {
    if (fs.existsSync("my_rough.json")) {
      const file = fs.readFileSync("my_rough.json");
      if (file.length > 0) {
        this.bookData = JSON.parse(file);
      }
    } else {
      this.bookData = {};
      this.saveData();
    }

    if (fs.existsSync("user_data.json")) {
      const file = fs.readFileSync("user_data.json");
      if (file.length > 0) {
        this.userData = JSON.parse(file);
      }
    } else {
      this.userData = {};
      this.saveUserData();
    }
  }

  saveData() {
    fs.writeFileSync("my_rough.json", JSON.stringify(this.bookData, null, 4));
  }

  saveUserData() {
    fs.writeFileSync("user_data.json", JSON.stringify(this.userData, null, 4));
  }

  createBook() {
    let bookName = input.question("Enter book name: ");
    let bookDetail = {
      "Author": input.question("Enter author: "),
      "Description": input.question("Enter description: "),
      "Rating": input.question("Enter rating: "),
      "Price": input.question("Enter price: "),
      "count": input.question("Enter count : ")
    };
    this.bookData[bookName] = bookDetail;
    this.saveData();
    this.adminUser();
  }

  signup() {
    let mobile = input.questionInt("Enter your mobile number: ");
    let len = String(mobile);
    if (len.length == 10) {
      if (!(mobile in this.userData)) {
        let user_name = input.question("Enter your name: ");
        let gmail = input.question("Enter your G-mail: ");
        let password = input.question("Enter your password: ");
        let info = { "user_name": user_name, "password": password, "gmail": gmail };
        this.userData[mobile] = info;
        this.saveUserData();
        console.log("You have signed up successfully!");
        this.option();
      } else {
        console.log("Account with this number already exists! Try LogIn!");
        this.adminUser();
      }
    } else {
      console.log("You dialed a 10-digit number!");
      this.adminUser();
    }
  }

  login() {
    let mobile = input.questionInt("Enter your mobile number: ");
    if (mobile in this.userData) {
      let password = input.question("Enter your password: ");
      if (this.userData[mobile]["password"] === password) {
        this.loggedInMobile = mobile;
        console.log("You have successfully logged in!");
        this.option();
      } else {
        console.log("Wrong password");
        this.option1();
      }
    } else {
      console.log("Wrong mobile number");
      this.option1();
    }
  }

  readBooks() {
    let c = 1;
    for (let i in this.bookData) {
      console.log(c + '.' + i);
      for (let j in this.bookData[i]) {
        console.log(`--- ${j}: ${this.bookData[i][j]}`);
      }
      c++;
    }
    this.option();
  }

  updateBook() {
    let bookName = input.question("Enter the book name to update: ");
    if (bookName in this.bookData) {
      let updated = {
        "Author": input.question("Enter author: "),
        "Description": input.question("Enter description: "),
        "Rating": input.question("Enter rating: "),
        "Price": input.question("Enter price: "),
        "count": input.question("Enter count: ")
      };
      for (let i in this.bookData[bookName]) {
        if (updated[i] !== "") {
          this.bookData[bookName][i] = updated[i];
        }
      }
      this.saveData();
      console.log("The book has been updated successfully!");
    } else {
      console.log("No book found to update.");
    }
    this.option();
  }

  deleteBook() {
    console.log("What do you want to do?\n1. Remove all data\n2. Remove a particular book");
    let option = input.questionInt("Choose an option: ");
    if (option === 1) {
      this.bookData = {};
      console.log("All data has been removed.");
      this.saveData();
    } else if (option === 2) {
      let bookName = input.question("Enter the book name to remove: ");
      if (bookName in this.bookData) {
        delete this.bookData[bookName];
        console.log(`The book "${bookName}" has been removed.`);
        this.saveData();
      } else {
        console.log("This book was not found.");
      }
    } else {
      console.log("Invalid Input");
    }
    this.option();
  }

  rentBook() {
    if (this.loggedInMobile) {
      let c = 1;
      for (let i in this.bookData) {
        console.log(`${c}. ${i}`);
        c++;
      }
      let bookName = input.question("Enter the book name to rent: ");
      if (this.bookData[bookName].count > 0) {
        if (bookName in this.bookData) {
          let mobile = input.questionInt("Enter your mobile number: ");
          if (mobile === this.loggedInMobile) {
            if (!this.userData[mobile].hasOwnProperty("rent")) {
              this.userData[mobile].rent = {};
              this.userData[mobile].rent[bookName] = 1;
            } else {
              if (this.userData[mobile].rent.hasOwnProperty(bookName)) {
                this.userData[mobile].rent[bookName] = this.userData[mobile].rent[bookName] + 1;
              } else {
                this.userData[mobile].rent[bookName] = 1;
              }
            }
            this.bookData[bookName].count--;
            this.saveData();
            console.log(`The book "${bookName}" has been rented successfully.`);
            this.saveUserData();
          } else {
            console.log("You can only return books using your own mobile number.");
            this.option();
          }
        } else {
          console.log(`The book "${bookName}" was not found.`);
        }
      } else {
        console.log(`The book "${bookName}" is out of stock.`);
      }
    } else {
      console.log("You need to log in first.");
      this.option1();
    }
    this.option();
  }

  returnBook() {
    if (this.loggedInMobile) {
      let mobile = input.questionInt("Enter your mobile number: ");
      if (mobile === this.loggedInMobile) {
        if (this.userData[mobile].hasOwnProperty("rent")) {
          if (mobile in this.userData) {
            let c = 1;
            for (let i in this.userData[mobile].rent) {
              console.log(`${c}. ${i} >>> ${this.userData[mobile].rent[i]}`);
              c++;
            }
            let bookName = input.question("Enter the book name to return: ");
            if (this.userData[mobile].rent[bookName] > 1) {
              let option = input.questionInt("You have more than 1 copy of this book.\nHow many copies do you want to return?: ");
              this.userData[mobile].rent[bookName] = this.userData[mobile].rent[bookName] - option;
              this.bookData[bookName].count += option;
              if (this.userData[mobile].rent[bookName] === 0) {
                delete this.userData[mobile].rent[bookName];
                this.saveUserData();
              }
              this.saveData();
            } else {
              delete this.userData[mobile].rent[bookName];
              this.bookData[bookName].count++;
            }
            this.saveUserData();
            this.saveData();
            console.log(`The book "${bookName}" has been returned successfully by mobile number ${mobile}!`);
          } else {
            console.log("No book is rented!");
            this.option();
          }
        } else {
          console.log(`Mobile number ${mobile} not found.`);
        }
      } else {
        console.log("You can only return books using your own mobile number.");
        this.option();
      }
    } else {
      console.log("You need to log in first.");
      this.option1();
    }
    this.option();
  }

  saveData() {
    fs.writeFileSync("my_rough.json", JSON.stringify(this.bookData, null, 4));
  }

  saveUserData() {
    fs.writeFileSync("user_data.json", JSON.stringify(this.userData, null, 4));
  }

  exit() {
    console.log("You are logged out.");
    this.option1();
  }

  admin() {
    let mobile = input.questionInt("Admin, enter your number: ");
    if (mobile === 9990619874) {
      let password = input.question("Admin, enter your password: ");
      if (password === "admin@123") {
        console.log("Welcome, Admin! You are successfully logged in to your account.");
        this.adminFn();
        while (true) {
          let option = input.questionInt("Continue to:\n1. Admin functions\n2. Exit\n");
          if (option === 1) {
            this.adminFn();
          } else {
            this.exit();
          }
        }
      } else {
        console.log("Admin, your password is wrong.");
        this.option1();
      }
    } else {
      console.log("Admin, your number is wrong.");
      this.option1();
    }
  }

  adminFn() {
    console.log("\nWhat would you like to do?\n1. Create book\n2. Read books\n3. Update book\n4. Delete book\n5. Log out");
    let option = input.questionInt("Choose an option: ");
    if (option === 1) {
      this.createBook();
    } else if (option === 2) {
      this.readBooks();
    } else if (option === 3) {
      this.updateBook();
    } else if (option === 4) {
      this.deleteBook();
    } else if (option === 5) {
      this.exit();
    } else {
      console.log("Admin, you chose an invalid option!");
      this.adminFn();
    }
  }

  option() {
    console.log("\nWhat would you like to do?\n1. Read books\n2. Rent book\n3. Return book\n4. Log out");
    let option = input.questionInt("Choose an option: ");
    if (option === 1) {
      this.readBooks();
    } else if (option === 2) {
      this.rentBook();
    } else if (option === 3) {
      this.returnBook();
    } else if (option === 4) {
      this.exit();
    } else {
      console.log("You chose an invalid option!");
      this.option();
    }
  }

  option1() {
    console.log("\nWhat would you like to do?\n1. Sign up\n2. Log in\n3. Admin\n4. Exit");
    let option = input.questionInt("Choose an option: ");
    if (option === 1) {
      this.signup();
    } else if (option === 2) {
      this.login();
    } else if (option === 3) {
      this.admin();
    } else if (option === 4) {
      this.exit();
    } else {
      console.log("You chose an invalid option!");
      this.option1();
    }
  }
}

const library = new Library();
library.loadData();
library.option1();


