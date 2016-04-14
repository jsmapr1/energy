module Update (..) where

import Models exposing (..)
import Actions exposing (..)
import Effects exposing (Effects)


update : Action -> ButtonModel -> ( ButtonModel, Effects Action )
update action model =
  ( model, Effects.none )
