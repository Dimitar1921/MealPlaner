import React from "react";

export default function Meal({ meal }) {
  // Construct image URL from Spoonacular API format
  // API returns image as filename like "Breakfast-Biscuits-and-Gravy-636026.jpg"
  const getImageUrl = () => {
    if (meal.image) {
      // If image is a full URL, return it
      if (meal.image.startsWith('http')) {
        return meal.image;
      }
      // Otherwise construct URL from filename
      return `https://spoonacular.com/recipeImages/${meal.image}`;
    }
    
    return null;
  };

  const imageUrl = getImageUrl();

  
  const styles = {
    meal: {
      backgroundColor: "#f8f8f8",
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "16px",
      margin: "16px 0",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    title: {
      color: "#333",
      fontSize: "24px",
      marginBottom: "8px",
    },
    image: {
      maxWidth: "100%",
      height: "auto",
      borderRadius: "4px",
    },
    instructions: {
      listStyle: "none",
      padding: 0,
      marginTop: "16px",
    },
    instructionItem: {
      listStyle: "none",
      marginBottom: "4px",
      color: "#666",
    },
    link: {
      display: "inline-block",
      marginTop: "12px",
      backgroundColor: "#007bff",
      color: "white",
      padding: "8px 16px",
      borderRadius: "4px",
      textDecoration: "none",
      transition: "background-color 0.3s ease",
    },
  };

  return (
    <article style={styles.meal}>
      <h1 style={styles.title}>{meal.title}</h1>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={meal.title}
          style={styles.image}
          onError={(e) => {
            // Hide image if it fails to load
            e.target.style.display = 'none';
          }}
        />
      ) : (
        <div style={{
          width: '100%',
          height: '200px',
          backgroundColor: '#e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          color: '#999',
          fontSize: '14px'
        }}>
          No Image Available
        </div>
      )}
      <ul style={styles.instructions}>
        <li style={styles.instructionItem}>
          Preparation time: {meal.readyInMinutes} minutes
        </li>
        <li style={styles.instructionItem}>
          Number of servings: {meal.servings}
        </li>
      </ul>
      <a
        href={meal.sourceUrl}
        target="_blank"
        rel="noreferrer"
        style={styles.link}
      >
        Go to Recipe
      </a>
    </article>
  );
}
