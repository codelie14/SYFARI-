#!/bin/bash

# Script de test complet pour SYFARI
# Ce script teste toutes les fonctionnalités de l'application

echo "🚀 SYFARI - Script de test complet"
echo "=================================="
echo ""

BASE_URL="http://localhost:3000"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# 1. Test de connexion au serveur
echo -e "${BLUE}1. Test de connexion au serveur...${NC}"
curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" > /tmp/test_result.txt
HTTP_CODE=$(cat /tmp/test_result.txt)
if [ "$HTTP_CODE" == "200" ]; then
    print_result 0 "Serveur accessible"
else
    print_result 1 "Serveur non accessible (HTTP $HTTP_CODE)"
    exit 1
fi
echo ""

# 2. Test d'initialisation de la base de données
echo -e "${BLUE}2. Test d'initialisation de la base de données...${NC}"
INIT_RESPONSE=$(curl -s "$BASE_URL/api/init")
if echo "$INIT_RESPONSE" | grep -q "succès"; then
    print_result 0 "Base de données initialisée"
else
    print_result 1 "Erreur d'initialisation"
fi
echo ""

# 3. Test d'inscription
echo -e "${BLUE}3. Test d'inscription d'un utilisateur...${NC}"
TIMESTAMP=$(date +%s)
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"test${TIMESTAMP}@syfari.com\",
        \"password\": \"test123\",
        \"nom\": \"Test\",
        \"prenom\": \"Utilisateur\",
        \"telephone\": \"+225 07 XX XX XX XX\"
    }")

TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token')
USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.user.id')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    print_result 0 "Inscription réussie"
    echo "   Token: ${TOKEN:0:50}..."
    echo "   User ID: $USER_ID"
else
    print_result 1 "Erreur d'inscription"
    echo "$REGISTER_RESPONSE"
fi
echo ""

# 4. Test de connexion
echo -e "${BLUE}4. Test de connexion...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"test${TIMESTAMP}@syfari.com\",
        \"password\": \"test123\"
    }")

LOGIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')

if [ "$LOGIN_TOKEN" != "null" ] && [ -n "$LOGIN_TOKEN" ]; then
    print_result 0 "Connexion réussie"
else
    print_result 1 "Erreur de connexion"
    echo "$LOGIN_RESPONSE"
fi
echo ""

# 5. Test de récupération des informations utilisateur
echo -e "${BLUE}5. Test de récupération du profil utilisateur...${NC}"
USER_RESPONSE=$(curl -s "$BASE_URL/api/user" \
    -H "Authorization: Bearer $TOKEN")

USER_EMAIL=$(echo "$USER_RESPONSE" | jq -r '.email')

if [ "$USER_EMAIL" == "test${TIMESTAMP}@syfari.com" ]; then
    print_result 0 "Profil utilisateur récupéré"
else
    print_result 1 "Erreur de récupération du profil"
fi
echo ""

# 6. Test de création d'un groupe
echo -e "${BLUE}6. Test de création d'un groupe...${NC}"
GROUPE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/groupes" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "nom": "Tontine de Test",
        "description": "Groupe créé par le script de test",
        "montant_cotisation": 5000,
        "frequence_cotisation": "mensuelle"
    }')

GROUPE_ID=$(echo "$GROUPE_RESPONSE" | jq -r '.id')

if [ "$GROUPE_ID" != "null" ] && [ -n "$GROUPE_ID" ]; then
    print_result 0 "Groupe créé"
    echo "   Groupe ID: $GROUPE_ID"
else
    print_result 1 "Erreur de création du groupe"
    echo "$GROUPE_RESPONSE"
fi
echo ""

# 7. Test de récupération des groupes
echo -e "${BLUE}7. Test de récupération des groupes...${NC}"
GROUPES_RESPONSE=$(curl -s "$BASE_URL/api/groupes" \
    -H "Authorization: Bearer $TOKEN")

NB_GROUPES=$(echo "$GROUPES_RESPONSE" | jq 'length')

if [ "$NB_GROUPES" -gt 0 ]; then
    print_result 0 "Groupes récupérés ($NB_GROUPES groupe(s))"
else
    print_result 1 "Aucun groupe trouvé"
fi
echo ""

# 8. Test de création d'une transaction
echo -e "${BLUE}8. Test de création d'une transaction...${NC}"
TRANSACTION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/transactions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
        \"groupe_id\": \"$GROUPE_ID\",
        \"montant\": 5000,
        \"type\": \"cotisation\",
        \"description\": \"Cotisation de test\"
    }")

TRANSACTION_ID=$(echo "$TRANSACTION_RESPONSE" | jq -r '.id')

if [ "$TRANSACTION_ID" != "null" ] && [ -n "$TRANSACTION_ID" ]; then
    print_result 0 "Transaction créée"
    echo "   Transaction ID: $TRANSACTION_ID"
else
    print_result 1 "Erreur de création de transaction"
    echo "$TRANSACTION_RESPONSE"
fi
echo ""

# 9. Test de récupération du détail d'un groupe
echo -e "${BLUE}9. Test de récupération du détail du groupe...${NC}"
GROUPE_DETAIL_RESPONSE=$(curl -s "$BASE_URL/api/groupes/$GROUPE_ID" \
    -H "Authorization: Bearer $TOKEN")

GROUPE_SOLDE=$(echo "$GROUPE_DETAIL_RESPONSE" | jq -r '.solde')

if [ "$GROUPE_SOLDE" == "5000.00" ]; then
    print_result 0 "Détail du groupe récupéré (Solde: $GROUPE_SOLDE F CFA)"
else
    print_result 1 "Erreur de récupération du détail"
    echo "Solde attendu: 5000.00, Solde reçu: $GROUPE_SOLDE"
fi
echo ""

# 10. Test du dashboard
echo -e "${BLUE}10. Test du tableau de bord...${NC}"
DASHBOARD_RESPONSE=$(curl -s "$BASE_URL/api/dashboard" \
    -H "Authorization: Bearer $TOKEN")

DASHBOARD_NB_GROUPES=$(echo "$DASHBOARD_RESPONSE" | jq -r '.nb_groupes')
DASHBOARD_SOLDE=$(echo "$DASHBOARD_RESPONSE" | jq -r '.solde_total')

if [ "$DASHBOARD_NB_GROUPES" -gt 0 ]; then
    print_result 0 "Dashboard récupéré"
    echo "   Nombre de groupes: $DASHBOARD_NB_GROUPES"
    echo "   Solde total: $DASHBOARD_SOLDE F CFA"
else
    print_result 1 "Erreur de récupération du dashboard"
fi
echo ""

# 11. Test de récupération des transactions
echo -e "${BLUE}11. Test de récupération des transactions...${NC}"
TRANSACTIONS_RESPONSE=$(curl -s "$BASE_URL/api/transactions?groupe_id=$GROUPE_ID" \
    -H "Authorization: Bearer $TOKEN")

NB_TRANSACTIONS=$(echo "$TRANSACTIONS_RESPONSE" | jq 'length')

if [ "$NB_TRANSACTIONS" -gt 0 ]; then
    print_result 0 "Transactions récupérées ($NB_TRANSACTIONS transaction(s))"
else
    print_result 1 "Aucune transaction trouvée"
fi
echo ""

# Résumé
echo ""
echo "=================================="
echo -e "${BLUE}📊 Résumé des tests${NC}"
echo "=================================="
echo "✅ Tests réussis"
echo "❌ Tests échoués (si présent)"
echo ""
echo -e "${GREEN}🎉 Tests terminés !${NC}"
echo ""
echo "📝 Données de test créées :"
echo "   Email: test${TIMESTAMP}@syfari.com"
echo "   Mot de passe: test123"
echo "   Groupe ID: $GROUPE_ID"
echo ""
echo "Vous pouvez vous connecter avec ces identifiants sur:"
echo "   $BASE_URL"
echo ""
