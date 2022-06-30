# Graccoon - GRAph COllaboration ONline

Routine :

```
npm run dev
```

# todo

## V0.1

- [X] trouver un truc pour pouvoir mettre les .html .css et dans public et que ça soit copié dans dist/ avec npm start (avec parcel)
- [X] gérer les svg (le dossier img est copié dans dist durant "npm run build")
- [X] amélioration code pour demander une modification sur le graphe (et que toutes les fonctions sur le graphe soit automatiquement restranscrite)
- [X] faire une classe Graph local pour qu'il n'y ait pas d'utilisation de données serveur (conseil Charly) 

- [x] draw edge
- [X] draw selected

- [X] move vertices
- [X] create vertices and edges
- [X] rooms
- [X] mode test pour que ça lance direct une unique room
- [X] suivre la fleche de l'utilisateur

- [X] selection au clic
- [X] sélection au clic d'arête
- [X] selection au rectangle
- [X] bouger une selection

- [X] structure Edge
- [X] ajout Edge

- [X] sauvegarder/charger json

- [X] suppression des sommets
- [X] delete edge

## V0.3

- [X] déplacer caméra
- [ ] recentrer
- [X] zoomer  
    - [X] CanvasCoord et ServerCoord
    - [X] sauvegarder les CanvasCoord des sommets, controlpoints pour moins de calcul ???
    - [X] corriger grille
    - [X] simplifier l'utilisation de g.align pour que ça soit plus clair

- [X] control_point
- [X] sélection au clic d'arête courbée
- [X] arc
- [X] vertex index
    - [ ] icones plus claires
    - [ ] décalage d'indice ?
    - [ ] utilité des numérotations stables ?
    - [ ] get_new_index devrait pas renvoyer le max des index +1 ? (pour suivre la création chronologique des sommets)
    
- [ ] poids (nombre) sur sommets ou arêtes

- [ ] nom utilisateur
- [X] curseur utilisateur
- [ ] couleur utilisateur

- [ ] Genre en faisant g.add_vertex(x,y), ça appelle socket.emit("add_vertex",x,y)
- [ ] constantes dans un fichier .json ou juste .ts ?? ou avec un css ???

## V0.5 Chercheurs proches

- couleur
    - [X] sommet
    - [ ] arête
    - [ ] interactor utilisation
    - [ ] color picker utilisation
- [ ] zone texte
- [ ] dessin à main levée
- [X] grille magnétique
- [X] aligner horizontalement/verticalement sur d'autres sommets
- [ ] gestion tablette
- [ ] optimisation possible en Math.floor() dans view.canvasCoord

## V1 GDRIM

- [ ] control Z
- [ ] copier coller
- [ ] exporter Latex
- [ ] exporter pdf
- [ ] export graphviz ?
- [ ] interactor/parameter/modifyer: les mettre dans des fichiers séparés
- [ ] zone graphe
- [ ] diapo graphe

### Parameter
- [X] bouton remove parametor marche pas
- [X] mettre en place la structure sans attribut
- [ ] paramètre en vert/rouge pour les booléens (genre is_connected, is_currently_planar)
- [ ] selection et parametre (genre s'il y a une sélection, nb_vertices renvoie la taille de la sélection)
- [ ] update parametre
- [ ] attributs
- [ ] déplacer les calculs dans le serveur

### Modifyer
- [ ] structure
- [ ] attributs

## V2 DMANET

- [ ] copier/coller le sous-graphe induit par la sélection de sommets
- [ ] turoriel
- [ ] multi-arêtes
- [ ] multi control point
- [ ] loop
- [ ] insertion de parametres ou modifiyer perso





