# gracofeu

Routine :

```
npm run dev
```

# todo

## Ecran

- [X] déplacer caméra
- [ ] recentrer
- [ ] zoomer
- [ ] grille

## Organisation backend

- [X] trouver un truc pour pouvoir mettre les .html .css et dans public et que ça soit copié dans dist/ avec npm start (avec parcel)
- [X] gérer les svg (le dossier img est copié dans dist durant "npm run build")
- [ ] interactor/parameter/modifyer: les mettre dans des fichiers séparés
- [X] amélioration code pour demander une modification sur le graphe (et que toutes les fonctions sur le graphe soit automatiquement restranscrite)
- [X] faire une classe Graph local pour qu'il n'y ait pas d'utilisation de données serveur (conseil Charly). - [ ] Genre en faisant g.add_vertex(x,y), ça appelle socket.emit("add_vertex",x,y)

## Draw

- [ ] constantes dans un fichier .json ou juste .ts ?
- [x] edge
- [ ] control_point
- [ ] arc
- [X] selected
- [ ] label/index ?


## Interactor

- [ ] suppression des élements sélectionnés
- [ ] delete edge et arc selected

interactor_selection:
- [X] selection au clic
- [ ] sélection au clic d'arête
- [ ] sélection au clic d'arête courbée
- [ ] selection au rectangle
- [X] bouger une selection
- [ ] changer la couleur d'un élément
- [ ] copier/coller le sous-graphe induit par la sélection de sommets


interactor_edge:
- [X] structure Edge
- [X] ajout Edge


interactor_arc:
- [ ] structure Arc
- [ ] ajout

## Parameter

- [X] bouton remove parametor marche pas
- [X] mettre en place la structure sans attribut
- [ ] paramètre en vert/rouge pour les booléens (genre is_connected, is_currently_planar)
- [ ] selection et parametre (genre s'il y a une sélection, nb_vertices renvoie la taille de la sélection)
- [ ] update parametre
- [ ] attributs
- [ ] déplacer les calculs dans le serveur

## Modifyer

- [ ] structure
- [ ] attributs

## Gestion plusieurs graphes

- [ ] tout

## Collaboration

- [X] move vertices
- [X] create vertices and edges
- [X] rooms
- [X] mode test pour que ça lance direct une unique room
- [ ] nom utilisateur
- [X] suivre la fleche de l'utilisateur

## Production

- [X] heroku
- [ ] faire tester par des gens pour trouver la disposition majoritairement intuitive

## Sauvegarde/Export

- [ ] sauvegarder -> juste vers un fichier du type .json
- [ ] charger .json
- [ ] exporter Latex
- [ ] exporter pdf
