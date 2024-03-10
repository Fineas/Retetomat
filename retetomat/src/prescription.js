const Prescription = () => { 
  
  // Placeholder for actual drug images and names
  const drugs = [
    { name: "Drug A", image: "path_to_image" },
    { name: "Drug B", image: "path_to_image" },
    { name: "Drug C", image: "path_to_image" },
    // Add other drugs here.
  ];

  return (
        <div className="container">
          <div>
            <img src="https://www.tylenol.com/sites/tylenol_us/files/styles/product_image/public/product-images/microsoftteams-image_1.png" />
          </div>
          <div>
            <img src="https://goldplant.ro/wp-content/uploads/2021/11/sirop-tusin-200ml.png" />
          </div>
          <div>
            <img src="http://placekitten.com/g/400/200" />
          </div>
        </div>
  );
}

export default Prescription;