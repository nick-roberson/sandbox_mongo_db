// Simple home page
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

// Third Party
import Input from '@mui/joy/Input';
import Grid from '@mui/system/Unstable_Grid';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';

// My imports
import { Configuration } from '../api';
import { DefaultApi } from '../api/apis';
import { RecipeModel } from '../api';
import { Ingredient } from '../api';
import { Instruction } from '../api';
import { Note } from '../api';

// function to take in apiClient and return all reicpes 
const getRecipes = async (apiClient: DefaultApi) => {
    const recipes = await apiClient.getAllRecipesAllGet();
    return recipes.recipes;
}

const addNote = async (apiClient: DefaultApi, recipe: RecipeModel) => {
    // if the recipe does not have an id, throw an error
    if (!recipe.id) {
        throw new Error("Recipe does not have an id");
    }

    // get the note title and body
    const title = document.getElementById("new-note-title") as HTMLInputElement;
    const body = document.getElementById("new-note-body") as HTMLInputElement;
    if (!title || !body) {
        throw new Error("Could not find the note title or body");
    }

    // create the note
    const note = {
        title: title.value,
        body: body.value,
    };

    // add the note to the recipe
    const response = await apiClient.addNoteNoteAddPost({
        recipeId: recipe.id,
        note: note,
    });

    return response;
}

const addInstruction = async (apiClient: DefaultApi, recipe: RecipeModel) => {
    // if the recipe does not have an id, throw an error
    if (!recipe.id) {
        throw new Error("Recipe does not have an id");
    }

    // get the instruction step and description
    const step = document.getElementById("new-instruction-step") as HTMLInputElement;
    const description = document.getElementById("new-instruction-description") as HTMLInputElement;
    if (!step || !description) {
        throw new Error("Could not find the instruction step or description");
    }

    // create the instruction
    const instruction = {
        step: step.value,
        description: description.value,
    };

    // add the instruction to the recipe
    const response = await apiClient.addInstructionInstructionAddPost({
        recipeId: recipe.id,
        instruction: instruction,
    });

    return response;
}

const addIngredient = async (apiClient: DefaultApi, recipe: RecipeModel) => {
    // if the recipe does not have an id, throw an error
    if (!recipe.id) {
        throw new Error("Recipe does not have an id");
    }

    // get the ingredient name, quantity, measurement, and preparation
    const name = document.getElementById("new-ingredient-name") as HTMLInputElement;
    const quantity = document.getElementById("new-ingredient-quantity") as HTMLInputElement;
    const measurement = document.getElementById("new-ingredient-measurement") as HTMLInputElement;
    const preparation = document.getElementById("new-ingredient-preparation") as HTMLInputElement;
    if (!name || !quantity || !measurement || !preparation) {
        throw new Error("Could not find the ingredient name, quantity, measurement, or preparation");
    }

    // create the ingredient
    const ingredient = {
        name: name.value,
        quantity: quantity.value,
        measurement: measurement.value,
        preparation: preparation.value,
    };

    // add the ingredient to the recipe
    const response = await apiClient.addIngredientIngredientAddPost({
        recipeId: recipe.id,
        ingredient: ingredient,
    });

    return response;
}


const displayRecipe = (apiClient: DefaultApi, recipe: RecipeModel) => {
    return (
        <div>

            <Typography variant="h6" gutterBottom>
                Name: {recipe.name}
            </Typography>

            <p>
                {recipe.description} 
            </p>

            <p>
                Source: {recipe.source?.toString()}
            </p>

            {/* Display the ingredients  as a list */}
            {
                recipe.ingredients ? (
                    <Accordion>
                        <AccordionSummary>
                            Ingredients
                        </AccordionSummary>
                        <AccordionDetails>
                            <List>
                                {recipe.ingredients.map((ingredient: Ingredient) => (
                                    <ListItem>
                                        <ListItemText 
                                            primary={ingredient.name + " " + ingredient.quantity + " " + ingredient.measurement}
                                            secondary={ingredient.preparation?.toString()}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </AccordionDetails>

                        <Grid container spacing={2}>
                            <Grid xs={2} m={.5}>
                                <Input id="new-ingredient-name" placeholder="Name"/>
                            </Grid>
                            <Grid xs={2} m={.5}>
                                <Input id="new-ingredient-quantity" placeholder="Quantity" />
                            </Grid>
                            <Grid xs={2} m={.5}>
                                <Input id="new-ingredient-measurement" placeholder="Measurement" />
                            </Grid>
                            <Grid xs={3} m={.5}>
                                <Input id="new-ingredient-preparation" placeholder="Preparation" />
                            </Grid>

                            <Grid xs={2} m={.5}>
                                <Button 
                                    variant="contained"
                                    color="primary"
                                    onClick={() => addIngredient(apiClient, recipe)}>Add Ingredient
                                </Button>
                            </Grid>
                        </Grid>

                    </Accordion>
                ) : "No ingredients yet."
            }

            {/* Display the instructions as a list */}
            {
                recipe.instructions ? (
                    <Accordion>
                        <AccordionSummary>
                            Instructions
                        </AccordionSummary>
                        <AccordionDetails>
                            <List>
                                {recipe.instructions.map((instruction: Instruction) => (
                                    <ListItem>
                                        <ListItemText 
                                            primary={instruction.step}
                                            secondary={instruction.description?.toString()}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </AccordionDetails>

                        <Grid container spacing={2}>
                            <Grid xs={3} m={.5}>
                                <Input id="new-instruction-step" placeholder="Step"/>
                            </Grid>
                            <Grid xs={6} m={.5}>
                                <Input id="new-instruction-description" placeholder="Description" />
                            </Grid>

                            <Grid xs={2} m={.5}>
                                <Button 
                                    variant="contained"
                                    color="primary"
                                    onClick={() => addInstruction(apiClient, recipe)}>Add Instruction
                                </Button>
                            </Grid>
                        </Grid>

                    </Accordion>
                ) : "No instructions yet."
            }

            {/* Display the notes as a list */}
            {
                recipe.notes ? (
                    <div>
                        <Accordion>
                            <AccordionSummary>
                                Notes
                            </AccordionSummary>
                            <AccordionDetails>
                                <List>
                                    {recipe.notes.map((note: Note) => (
                                        <ListItem>
                                            <ListItemText 
                                                primary={note.title}
                                                secondary={note.body}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </AccordionDetails>

                            <Grid container spacing={2}>
                                <Grid xs={3} m={.5}>
                                    <Input id="new-note-title" placeholder="Title"/>
                                </Grid>
                                <Grid xs={6} m={.5}>
                                    <Input id="new-note-body" placeholder="Body" />
                                </Grid>
                                <Grid xs={2} m={.5}>
                                    <Button 
                                        variant="contained"
                                        color="primary"
                                        onClick={() => addNote(apiClient, recipe)}>Add Note
                                    </Button>
                                </Grid>
                            </Grid>
                        </Accordion>

                    </div>
                ) : "No notes yet"
            }


        </div>
    );
}


export function MyRecipes() {

    // api client and recipes state
    const [apiClient, setApiClient] = React.useState<DefaultApi | null>(null);
    const [allRecipes, setAllRecipes] = React.useState<RecipeModel[] | null>(null);
    const [selectedRecipe, setSelectedRecipe] = React.useState<RecipeModel | null>(null);

    // Runs Once: Initialize your API client with the base URL
    useEffect(() => {
        // create a new api client
        const configuration = new Configuration({
            basePath: "http://localhost:8000",
        });
        const api = new DefaultApi(configuration);

        // set the api client
        setApiClient(api);

        // load the recipes 
        getRecipes(api).then((recipes) => {
            setAllRecipes(recipes);
            // set the selected recipe to the first recipe
            setSelectedRecipe(recipes[0]);
        });

    }, []);

    return (
        <div>
        <Grid container spacing={2}>

            {/* Display the recipes in a toolbar on the left */}
            <Grid xs={2} m={2}>
                <Box>
                    <Typography variant="h4" gutterBottom>
                        Recipes
                    </Typography>
                    <List>
                        {allRecipes?.map((recipe) => (
                            <ListItem>
                                <ListItemText 
                                    primary={recipe.name}
                                    onClick={() => setSelectedRecipe(recipe)}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Grid>

            {/* Display the recipe details on the right */}
            <Grid xs={9} m={2}>
                <Box>
                    {apiClient && selectedRecipe ? displayRecipe(apiClient, selectedRecipe) : <Alert severity="error">No recipe selected</Alert>}
                </Box>
            </Grid>

        </Grid>
        </div>
    );
}

export default MyRecipes;
