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
    - [ ] get_new_index devrait pas renvoyer le max des index +1 ? (pour suivre la création chronologique des sommets)
    - [ ] aide sur les actions
    - [ ] possibilité de modifier les labels
    

- utilisateur
    - [X] nom utilisateur
    - [X] curseur utilisateur
    - [X] suivre
    - [X] en dehors de l'écran

- [ ] Genre en faisant g.add_vertex(x,y), ça appelle socket.emit("add_vertex",x,y)
- [ ] constantes dans un fichier .json ou juste .ts ?? ou avec un css ???

- [ ] serverCoord -> inclus automatiquement canvasCoord
- [X] interactor: visibilité et cliquabilité de certains éléments
- [ ] curseur des interacteurs

## V0.5 Chercheurs proches

- couleur
    - [X] sommet
    - [X] arête
    - [X] interactor utilisation
    - [X] color picker utilisation
- [ ] zone texte
- [X] grille magnétique
- [X] aligner horizontalement/verticalement sur d'autres sommets
- [ ] gestion tablette
- [ ] optimisation possible en Math.floor() dans view.canvasCoord

- stroke
    - [ ] selectionner mieux
    - [ ] déplacer
    - [X] effacer serveur
    - [ ] effacer mieux (plus tard)
    - [ ] affichage en live (plus tard, interet ??)

- area 
    - [ ] clic sur label dans parametre -> centrer sur area
    - [X] modifier rectangle area
    - [X] déplacer area
    - [ ] voir l'area se créé

- parametre
    - [ ] ranger par area
    - [ ] mise à jour pas tout le temps pour genre ceux qui ont pas besoin de la position
    - [X] bouton remove parametor marche pas
    - [X] mettre en place la structure sans attribut
    - [ ] paramètre en vert/rouge pour les booléens (genre is_connected, is_currently_planar)
    - [ ] update parametre
    - [ ] parametres classiques : distance (diametre), degré (min, max, moyen, sequence), is_currently_planar, is_planar, is_bipartite, is_sparse, is_connected 



## V1 GDRIM

- [ ] control Z
- [ ] copier coller
- [ ] exporter Latex
- [ ] exporter pdf
- [ ] export graphviz ?
- [ ] interactor/parameter/modifyer: les mettre dans des fichiers séparés
- [ ] diapo graphe
- [ ] poids (nombre) sur sommets ou arêtes

- parametre
    - [ ] attributs
    - [ ] déplacer les calculs dans le serveur ??


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
- [ ] chat vocal
- [ ] chat écrit


# Known issues 
- Chrome : no export to file? 
- Parametors may appear several times
- zoom and create links
    solution : changer les canvasCoord en serverCoord (genre link_creating_start) puis au zoom mettre à jour les serverCoord dans view
    OU
    interdire le zoom pendant la création ?
- start resizing area, then leave mouse out of window, stop clicking, then mouse back on window = bug -> pareil avec création de link, couleur, pen ... solution avec événement outofscreen si existe ?


