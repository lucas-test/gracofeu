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

- [X] draw edge
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
    - [X] icones plus claires
    - [X] aide sur les actions
    

- utilisateur
    - [X] nom utilisateur
    - [X] curseur utilisateur
    - [X] suivre
    - [X] en dehors de l'écran

- [ ] Genre en faisant g.add_vertex(x,y), ça appelle socket.emit("add_vertex",x,y)
- [ ] constantes dans un fichier .json ou juste .ts ?? ou avec un css ???

- serverCoord -> inclus automatiquement canvasCoord
    - [X] vertex
    - [X] link
    - [X] stroke
    - [X] area
- [X] interactor: visibilité et cliquabilité de certains éléments
- [X] curseur des interacteurs
- [ ] ne pas utiliser local_board dans le dossier board

## V0.5 Chercheurs proches

- couleur
    - [X] sommet
    - [X] arête
    - [X] interactor utilisation
    - [X] color picker utilisation

- [X] grille magnétique
- [X] aligner horizontalement/verticalement sur d'autres sommets

- stroke
    - [X] selectionner mieux
    - [X] déplacer
    - [X] effacer serveur
    - [ ] effacer mieux (plus tard)
    - [ ] création et translation en live (plus tard, interet ??)

- area 
    - [X] clic sur label dans parametre -> centrer sur area
    - [X] modifier rectangle area
    - [X] déplacer area
    - [X] voir l'area se créer
    - [X] déplacer area avec les sommets dedans

- parametre
    - [X] ranger par area
    - [X] mise à jour pas tout le temps pour genre ceux qui ont pas besoin de la position
    - [X] bouton remove parametor marche pas
    - [X] mettre en place la structure sans attribut
    - [X] paramètre en vert/rouge pour les booléens (genre is_connected, is_currently_planar)
    - [X] update parametre
    - [ ] doc
    - [ ] verbose
    - parametres classiques : 
        - [X] distance (diametre)
        - [X] degré (min, max, moyen)
        - [ ] séquence degrés
        - [X] is_connected
        - [X] number connected components
        - [ ] is_currently_planar
        - [ ] is_planar 
        - [ ] is_bipartite
        - [ ] is_sparse 
        - [X] is_coloring_propre

- labels
    - [ ] modifier les labels
    - [ ] placement des labels

- [ ] gestion tablette
- [ ] optimisation possible en Math.floor() dans view.canvasCoord
- [ ] zone texte


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


- modifyer
    - [ ] structure
    - [ ] attributs
    - classiques :
        - [ ] random_graph(n,p) et directed
        - [ ] random_tournament(n)
        - [ ] Paley

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
- Diameter : Only non oriented
- zoom and create links
    solution : changer les canvasCoord en serverCoord (genre link_creating_start) puis au zoom mettre à jour les serverCoord dans view
    OU
    interdire le zoom pendant la création ?
- start resizing area, then leave mouse out of window, stop clicking, then mouse back on window = bug -> pareil avec création de link, couleur, pen ... solution avec événement outofscreen si existe ?
- bug avec param Geometric et sommet qui rentre dans area
- vertex align crée des sommets sur d'autres sommets

