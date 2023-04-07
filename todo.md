# TODO

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

- control point interactor
    - [X] it works

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
    - [ ] améliorer pour plus de visibilité
    - [X] couleur

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
    - [X] doc
    - [ ] doc gestion latex
    - [ ] verbose
    - [ ] import à partir d'une fonction de gramoloss




- [ ] gestion tablette
- [ ] optimisation possible en Math.floor() dans view.canvasCoord
- quand on déplace un sommet sur un autre ça les fusionne
    - [X] ça marche
    - [ ] visuel qui dit que ça va fusionner quand on déplace
    - [ ] aligner le sommet déplacé sur le sommet cible ?
    - [ ] fusion des aretes : garder les couleurs et les cp ?
- [ ] trouver une autre visualisation des sommets et arêtes séléctionnés
- [ ] interactor move (qui fait que déplacer la vue ou les éléments)
- [ ] interactor select2: pas besoin de faire CTRL pour pas en avoir besoin pour la tablette ?
- [X] pouvoir supprimer les areas
- [X] changer le svg du "load file"
- interactor distance ?? on clique sur un sommet et ça affiche une règle de mesure pour mesurer la distance à un autre sommet survolé. On peut faire ça pour d'autres paramètres ultra classiques (degré ?)

- generators
    - [X] ça marche
    - [X] gérer pour n = 0
    - [X] style
    - [X] unifier le style pour la croix qui ferme le div, j'ai une utilisé une classe "close_button"
    - [X] liste avec possibilité de faire une recherche
    - [ ] prévisualisation du rendu ??
    - [X] en faire plusieurs à la suite avec Ctrl
    - [ ] import à partir de Gramoloss
    - implémenter :
        - [X] random_graph(n,p) et directed
        - [X] random_tournament(n)
        - [ ] Paley

- text interactor
    - [X] link weight
    - [X] vertex weight
    - [X] text zone
    - [ ] manually positioning labels
    - [X] automatically positioning
    - [X] improve performance by saving the generated image
    - [X] latex
    - [X] optimiser les poids dans "i get graph"

- TextZone
    - [X] contentEditable
    - [X] clean obsolete text_zone_input (textarea)
    - [ ] issue: two <Enter> gives 3 <br> ...
    - [ ] security:  exclude html tag (like <br>)
    - [X] latex auto generating
    - [ ] md auto-generating
    - [ ] mutex: two clients should not edit textZone simultaneously
    - [ ] highlight
    - [ ] set carret to the position of the click (difficulty: hard)
    - [ ] improve tab insertion
    - [ ] too much Modification to cancel

- copier coller
    - [X] ça marche
    - [ ] est ce que ça serait pas plus logique un Control D ?
    - [ ] est ce que ça serait pas plus logique de juste faire Control et glisser ?
    - [ ] est ce que faut prendre les aretes induites meme si elles sont pas séléctionnées ?
    - [ ] est ce que faudrait pas un autre type de dupliquer qui conserve les links avec le reste ?

## V1 GDRIM

- [ ] load/export json

- control Z
    - [X] ça marche
    - [X] delete_selected_elements
    - [X] paste_graph
    - [X] vertices_merge
    - [X] REMOVE THIS update_positions
    - [X] translate_control_points
    - [X] update_control_points : remove
    - [X] add_area
    - [X] area_move_side
    - [X] area_move_corner
    - [X] translate_areas
    - [X] area_update not working
    - [X] remove area_translate
    - [X] add_stroke
    - [X] delete_stroke (should be done in delete_selected_elements)
    - [X] remove update_strokes
    - [X] translate_strokes
    - [X] update_colors
    - [ ] load_json

    - [X] mettre tout dans gracofeu pour simplifier les broadcast

- server API
    - [X] put all modifications from gramoloss to gracofeu (le but c'est de simplifier les sensibilities qui sont fausses)
    - [ ] fix sensibilities and Return of Modifications
    - [X] add_elements
    - [X] update_elements (used for coloring several elements)
    - [ ] classes for emit (so that it checks the type of the emitted elements)

- Representations
    - [ ] le recadagre d'une représentation devrait être la même que pour area et une forme rectangulaire
    - [X] créer des tournois facilement à partir des backarcs
    - [ ] mise à jour de la repré
    - [ ] repré en fonction d'une area
    - [ ] delete repré
    - [ ] dw: afficher les stats du current: cutwidth, nb backarc
    - [ ] une autre repré : planaire y en a plein
    - [ ] param: dw, is_sparse, glouton, fas
    - [ ] collabiser les représ
    - [ ] annulable

- control Z Optimizations and refactorizations 
    - [X] adapt CanvasVect and ServerVect to translation of CPs and vertices
    - [X] translate_control_points : just send cps not all graph
    - [X] get modifications out of graph, so that Modification has a method "implement" and "undo" on a graph

- [ ] exporter Latex
- [ ] exporter pdf
- [ ] export graphviz ?
- [ ] interactor/parameter/modifyer: les mettre dans des fichiers séparés
- [ ] diapo graphe

- parametre
    - [ ] attributs
    - [ ] déplacer les calculs dans le serveur ??
    - [ ] fix update

- Resizable
    - [X] area doit utiliser cette interface
    - [X] déplacer avec selection
    - [X] resize
    - [X] emit changements
    - [X] nettoyer area_interactor pour les curseurs
    - [X] afficher les curseurs lorsque Resize est autorisé


- modifyer
    - [X] structure
    - [X] attributs
    - [X] server
    - implémenter :
        - [X] into_tournament


- graph moving modifyer
    - modifie automatiquement le graphe en fonction du placement des sommets
    - exemples 
        - [ ] degreewidth
        - [ ] unit disk graph (v est relié w ssi la distance graphique <= 1 )
        
- [X] webhook

- [ ] loop


- SideBars and InteractorV2
    - [ ] rename InteractorV2 to Interactor
    - [ ] move right_side_bar to left
    - [ ] shortcut
    - [ ] select interactor in folder
    - [ ] fix color interactor
    - [ ] fix cursors ( color_interactorV2 and pen)
    - [ ] bottom_side_bar
    - [ ] change label action to graph modifyer

## V2 DMANET

- [ ] code break dans les compute function (voir la note dans le fichier parametor.ts)
- [ ] copier/coller le sous-graphe induit par la sélection de sommets
- [ ] turoriel
- [ ] multi-arêtes
- [ ] multi control point
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

