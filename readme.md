# gracofeu

Routine :

```
npm run dev
```

# todo

## Ecran

- [ ] déplacer caméra
- [ ] recentrer
- [ ] zoomer
- [ ] grille

## Organisation backend

- [X] trouver un truc pour pouvoir mettre les .html .css et dans public et que ça soit copié dans dist/ avec npm start (avec parcel)
- [X] gérer les svg (le dossier img est copié dans dist durant "npm run build")
- [ ] interactor/parameter/modifyer: les mettre dans des fichiers séparés
- [ ] amélioration code pour demander une modification sur le graphe (et que toutes les fonctions sur le graphe soit automatiquement restranscrite)


## Draw

- [ ] constantes dans un fichier .json ?
- [x] edge
- [ ] control_point
- [ ] arc
- [ ] selected
- [ ] label/index ?


## Interactor

interactor_selection:
- [ ] selection au clic
- [ ] selection au rectangle
- [ ] bouger une selection
- [ ] changer la couleur d'un élément

interactor_edge:
- [X] structure Edge
- [X] ajout Edge
- [ ] suppression d'edge

interactor_arc:
- [X] structure Arc
- [ ] ajout
- [ ] suppression d'arc

## Parameter

- [X] bouton remove parametor marche pas
- [X] mettre en place la structure sans attribut
- [ ] selection de parametre
- [ ] update parametre
- [ ] attributs

## Modifyer

- [ ] structure
- [ ] attributs

## Gestion plusieurs graphes

- [ ] tout

## Collaboration

- [X] move vertices
- [X] create vertices and edges
- [ ] rooms
- [ ] mode test pour que ça lance direct une room
- [ ] une meta fonction pour faire des modifs sur le graphe avec socket ??
- [ ] nom utilisateur
- [ ] suivre la fleche de l'utilisateur

## Production

- [X] heroku
- [ ] faire tester par des gens pour trouver la disposition majoritairement intuitive

## Compte


- [ ] sauvegarder
- [ ] exporter

