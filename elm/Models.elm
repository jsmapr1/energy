module Models (..) where


type alias AppModel =
  {}


initialModel : AppModel
initialModel =
  {}

type alias ButtonModel = 
  { active: Bool }

initialButton : ButtonModel
initialButton = 
  {active = False}
