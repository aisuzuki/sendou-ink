import { gql } from "apollo-boost"

export const searchForPlayers = gql`
  query searchForPlayers($name: String!, $exact: Boolean) {
    searchForPlayers(name: $name, exact: $exact) {
      name
      x_power
      weapon
      unique_id
    }
  }
`
