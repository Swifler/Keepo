export type RootTabParamList = {
  Inventory: undefined
  Camera: undefined
  Recipes: undefined
  ShoppingList: undefined
  Profile: undefined
  Subscription: undefined
}

export type InventoryStackParamList = {
  InventoryList: undefined
  InventoryDetail: { itemId: string }
  EditInventoryItem: { itemId?: string }
}

export type RecipesStackParamList = {
  RecipesList: undefined
  RecipeDetail: { recipeId: string }
}

export type ShoppingListStackParamList = {
  ShoppingListMain: undefined
  AddShoppingItem: undefined
}
