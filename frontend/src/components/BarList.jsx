import { IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

function BarList({ handleRemoveButton, handleAddButton, title, bars , submitButton, buttonText}) {
  if (!bars || bars.length === 0) return null

  return (
    <div className="bars-list">
      <h2>{title} ({bars.length})</h2>
      <div className="bars-list-content">
        {bars.map((bar, index) => (
          <div key={bar._id} className="bar-item">
            <span className="bar-number">{index + 1}</span>
            <div className="bar-info">
              <strong>{bar?.name}</strong>
              <span className="bar-address">{bar?.address}</span>
            </div>
            {handleRemoveButton && (
              <Tooltip title="Remove">
                <IconButton 
                  onClick={() => handleRemoveButton(bar._id || bar.id)}
                  aria-label="Remove bar"
                  size="small"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {handleAddButton && (
              <Tooltip title="Add to route">
                <IconButton
                  onClick={() => handleAddButton(bar._id)}
                  aria-label="Add bar"
                  size="small"
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </div>
        ))}
      </div>
      {submitButton && <button type="submit" className="add-btn" onClick={submitButton}>
          Create Event
      </button>}
      
    </div>
  )
}

export default BarList