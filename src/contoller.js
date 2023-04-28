import { Service } from './service.js'

class Controller {

    service = new Service()
    operationList = ['addition', 'subtraction', 'division', 'multiplication']

    get = async (req,  res) => {
      const firstNumber = Number(req.query.first_number)
      const secondNumber = Number(req.query.second_number)
      const operation = req.query.operation

      if(!firstNumber || !secondNumber && secondNumber!==0){
        return res.status(404).json({ 
          success: false,
          message:'Калькулятор умеет работать только с числами. Убедитесь в валидности введеных данных'
        })
      }

      if(!this.operationList.includes(operation)){
        return res.status(404).json({ 
          success: false, 
          message:"Запрашиваемая математическая операция не поддерживается. Разрешенные математические операции: 'addition', 'subtraction', 'division', 'multiplication' "
        })
      }

      const response = await this.service.get(firstNumber, secondNumber, operation)


      return response===Infinity? res.json({result: "Infinity"}):res.json({result:response})
    }
}

export default Controller
