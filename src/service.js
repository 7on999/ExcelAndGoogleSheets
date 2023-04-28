export class Service {

     async get(firstNumber, secondNumber, operation) {
      switch (operation) {
        case "addition":
          return firstNumber+secondNumber
        case "subtraction":
            return firstNumber-secondNumber
        case "division":
          return firstNumber/secondNumber
        case "multiplication":
          return firstNumber*secondNumber
        default:
          return 'Что-то пошло не так'
      }
    }
}
