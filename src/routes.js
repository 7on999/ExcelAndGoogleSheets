import { Router } from "express"
import Controller from "./contoller.js"

class Route {
  
  router = Router()
  controller = new Controller()

  constructor() {
    this.initializeRoutes()
  }

  initializeRoutes() {
    this.router.get("/calculate", this.controller.get)
  }
}

export default new Route().router
