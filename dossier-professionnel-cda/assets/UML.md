```@startuml
left to right direction
skinparam packageStyle rectangle

actor Organisateur
actor Invité
actor "Hébergeur" as Hebergeur

rectangle "Application de planification d'événements" {

  usecase "Créer un événement" as UC1
  usecase "Inviter des participants" as UC2
  usecase "Gérer checklist" as UC3
  usecase "Calculer les ressources" as UC4
  usecase "Générer la liste de courses" as UC5
  usecase "Envoyer des rappels automatiques" as UC6
  usecase "Gérer les hébergements" as UC7

  usecase "Confirmer participation" as UC8
  usecase "Voir qui ramène quoi" as UC9
  usecase "Choisir ce qu’il ramène" as UC10
  usecase "Proposer un hébergement" as UC11
  usecase "Héberger un invité" as UC12
}

Organisateur --> UC1
Organisateur --> UC2
Organisateur --> UC3
Organisateur --> UC4
Organisateur --> UC5
Organisateur --> UC6
Organisateur --> UC7

Invité --> UC8
Invité --> UC9
Invité --> UC10
Invité --> UC11

Hebergeur --> UC12
Hebergeur -up- Invité : <<extends>>
@enduml
```
