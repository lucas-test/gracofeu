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
- [ ] zoomer

- [ ] constantes dans un fichier .json ou juste .ts ?? ou avec un css ???
- [X] control_point
- [ ] sélection au clic d'arête courbée
- [ ] arc
- [ ] label/index ?
- [ ] poids (nombre) sur sommets ou arêtes

- [ ] nom utilisateur
- [X] curseur utilisateur
- [ ] couleur utilisateur

- [ ] Genre en faisant g.add_vertex(x,y), ça appelle socket.emit("add_vertex",x,y)


## V0.5 Chercheurs proches

- [ ] couleur sommet/arête
- [ ] zone texte
- [ ] dessin à main levée
- [ ] grille magnétique

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





