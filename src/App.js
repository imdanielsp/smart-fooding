//@ts-check
import React, { Component } from 'react';
import './App.css';
import { Navbar, Nav, Button, Form, Container, Card, ListGroup, Row, Col, Modal } from "react-bootstrap";
import Recipes from "./recipes";
import ConstantItems from "./constantItems";

let defaultNumOfRecipes = Recipes.length > 12 ? 12 : Recipes.length;
let defaultRecipeFactor = 1;

const generateRecipes = (numOfRecipes) => {
  if (numOfRecipes > Recipes.length || numOfRecipes <= 0) {
    numOfRecipes = Recipes.length;
  }

  let recipesIdx = [];
  let recipes = [];

  do {
    let newIdx = Math.floor(Math.random() * Recipes.length);

    if (!recipesIdx.includes(newIdx)) {
      recipesIdx.push(newIdx);
      recipes.push(Recipes[newIdx]);
    }
    console.log(numOfRecipes);
  } while (recipesIdx.length !== numOfRecipes);

  return recipes;
};

const bundleIngredients = ingredients => {
  return ingredients
  .concat(
    ConstantItems.map(title => {
      return { title, items: [ {"name": title, "quantity": "", "units": "" } ] }
    }
  ))
  .reduce((prev, curr) => {
    prev.push(curr.items);
    return prev.flat();
  }, [])
  .reduce((prev, curr) => {
    if (prev.has(curr.name)) {
      prev.get(curr.name).quantity += curr.quantity;
    } else {
      prev.set(curr.name, curr);
    }
    return prev;
  }, new Map());
}

const renderIngredients = (ingredients) => {
  return (
    <ListGroup>
      {ingredients.map((ingredient, idx) => {
        return (
          <ListGroup.Item key={idx}>{`${ingredient.quantity} ${ingredient.units}  ${ingredient.name}`}</ListGroup.Item>
        );
      })}
    </ListGroup>
  )
};

const renderRecipe = (recipe, idx) => {
  return (
    <Col key={idx}>
      <Card style={{ width: '18rem', marginTop: 15 }}>
        {/* <Card.Img variant="top" src={recipe.img} /> */}
        <Card.Body>
          <Card.Title>{recipe.title}</Card.Title>
          <Card.Header>Ingredients</Card.Header>
          {renderIngredients(recipe.items)}
        </Card.Body>
      </Card>
    </Col>
  )
};

const renderIngredientsList = (ingredients, factor, storage) => {
  return (
    <div id="ingredients">{
      Array.from(ingredients).map((ingredient, idx) => {
        return (
          <Form.Check key={idx}
            type="checkbox"
            value={ingredient[1].name}
            onClick={evt => storage.setItem(evt.target.value, evt.target.checked ? "checked" : "unchecked")}
            defaultChecked={storage.getItem(ingredient[1].name) === "checked" ? true : false}
            label={`${ingredient[1].quantity * factor} ${ingredient[1].units} ${ingredient[1].name}`} />
        );
      })
    }
    </div>)
}

class App extends Component {
  constructor(props) {
    super(props);

    this.storage = window.localStorage;

    let recipes = undefined;
    if (!this.storage.getItem('recipes')) {
      recipes = generateRecipes(defaultNumOfRecipes)
      this.storage.setItem("recipes", JSON.stringify(recipes));
    } else {
      recipes = JSON.parse(this.storage.getItem('recipes'));
    }

    defaultNumOfRecipes = this.storage.getItem('numOfRecipes') ?
    parseInt(this.storage.getItem('numOfRecipes')) : defaultNumOfRecipes;

    defaultRecipeFactor = this.storage.getItem('recipeFactor') ?
    parseInt(this.storage.getItem('recipeFactor')) : defaultRecipeFactor;

    this.state = {
      numOfRecipes: defaultNumOfRecipes,
      recipeFactor: defaultRecipeFactor,
      recipes: recipes,
      showIndregients: false,
      ingredientsList: []
    }
  }

  handleNewList() {
    let numOfRecipes = parseInt(this.storage.getItem('numOfRecipes'));

    this.storage.clear();

    const recipes = generateRecipes(this.state.numOfRecipes)
    this.storage.setItem('recipes', JSON.stringify(recipes));
    this.storage.setItem('numOfRecipes', numOfRecipes + "");

    this.setState({
      recipes: recipes,
      ingredientsList: [],
      numOfRecipes: numOfRecipes
    })
  }

  handleNumOfRecipesChanged(evt) {
    this.storage.setItem('numOfRecipes', evt.target.value + "");
    this.setState({ numOfRecipes: parseInt(evt.target.value) });
  }

  handleRecipeFactorChanged(evt) {
    this.storage.setItem('recipeFactor', evt.target.value + "");
    this.setState({ recipeFactor: parseInt(evt.target.value) });
  }

  handleShowIngredients() {
    this.setState({
      ingredientsList: bundleIngredients(JSON.parse(JSON.stringify(this.state.recipes))),
      showIndregients: true,
    })
  }

  handleClose() {
    this.setState({ showIndregients: false });
  }

  handleCopy() {
    let ingredientsList = document.getElementById("ingredients");
    let selection = window.getSelection();
    let range = document.createRange();
    range.selectNodeContents(ingredientsList);
    selection.removeAllRanges();
    selection.addRange(range);

    document.execCommand("copy");
    selection.removeAllRanges();
  }

  handleEmail() {
    let today = new Date();
    let content = encodeURIComponent(
      Array.from(this.state.ingredientsList).reduce((prev, curr) =>
        prev + `${curr[1].quantity} ${curr[1].units} ${curr[1].name} \n`, ""
      )
    )

    window.location.href = `mailto:dsantosp12@gmail.com,sespinal222@gmail.com` +
      `?subject=${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()} Ingredients List
      &body=${content}`
    
  }

  render() {
    return (
      <div id="app">
        <Navbar expand="lg" style={{ borderBottom: "1px solid #E4E4E2" }}>
          <Navbar.Brand href="#home">Smart Fooding</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Form inline>
                <Form.Group controlId="numOfRecipes">
                  <Form.Label style={{ marginRight: 10 }}>Num. Of Recipes:</Form.Label>
                  <Form.Control onChange={this.handleNumOfRecipesChanged.bind(this)} type="number" placeholder={this.state.numOfRecipes} className="mr-sm-2" />
                  <Button onClick={this.handleNewList.bind(this)} variant="outline-success">New List</Button>
                </Form.Group>
                <Form.Group controlId="recipeFactor">
                  <Form.Label style={{ marginLeft: 10, marginRight: 10 }}>Increment Factor:</Form.Label>
                  <Form.Control onChange={this.handleRecipeFactorChanged.bind(this)} type="number" placeholder={this.state.recipeFactor} className="mr-sm-2" />
                </Form.Group>
              </Form>
            </Nav>
            <Button onClick={this.handleShowIngredients.bind(this)}>Show Ingredients</Button>
          </Navbar.Collapse>
        </Navbar>
        <Container>
          <Row>
            {this.state.recipes.map(renderRecipe)}
          </Row>
        </Container>
        <Modal show={this.state.showIndregients} onHide={this.handleClose.bind(this)}>
          <Modal.Header closeButton>
            <Modal.Title>Ingredients</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {
              renderIngredientsList(this.state.ingredientsList, this.state.recipeFactor, this.storage)
            }
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose.bind(this)}>
              Close
            </Button>
            <Button variant="primary" onClick={this.handleCopy.bind(this)}>
              Copy
            </Button>
            <Button variant="primary" onClick={this.handleEmail.bind(this)}>
              Send as Email
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default App;
