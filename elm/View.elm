module View (..) where

import Html exposing (..)
import Html.Lazy exposing (lazy2)
import Actions exposing (..)
import Models exposing (..)


view : Signal.Address Action -> ButtonModel -> Html
view address model =
  let
      words = "foo"
  in
  div
    []
    [ lazy2 button address model.active ]

button: Signal.Address Action -> Bool -> Html
button address active=
  let
      words = if active then "Dectivate" else "Activate"
  in
  div [][text words]
