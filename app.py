from flask import Flask, render_template, jsonify, request
from datetime import datetime

app = Flask(__name__)

# Define a Linked List Node
class TaskNode:
    def __init__(self, task_id, title, description, date, done=False):
        self.id = task_id
        self.title = title
        self.description = description
        self.date = date
        self.done = done  # Track completion status
        self.next = None

# Define the Linked List
class TaskLinkedList:
    def __init__(self):
        self.head = None
        self.task_id_counter = 1

    def add_task(self, title, description, date=None, done=False):
        """ Add a new task to the linked list """
        if not date:
            date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        new_task = TaskNode(self.task_id_counter, title, description, date, done)
        new_task.next = self.head  # Add to  beginning 
        self.head = new_task
        self.task_id_counter += 1
        return new_task

    def get_tasks(self):
        """ Retrieve all tasks """
        tasks = []
        current = self.head
        while current:
            tasks.append({
                "id": current.id,
                "title": current.title,
                "description": current.description,
                "date": current.date,
                "done": current.done
            })
            current = current.next
        return tasks

    def get_task(self, task_id):
        """ Get a single task by ID """
        current = self.head
        while current:
            if current.id == task_id:
                return {
                    "id": current.id,
                    "title": current.title,
                    "description": current.description,
                    "date": current.date,
                    "done": current.done
                }
            current = current.next
        return None

    def delete_task(self, task_id):
        """ Delete a task """
        current = self.head
        prev = None
        while current:
            if current.id == task_id:
                if prev:
                    prev.next = current.next
                else:
                    self.head = current.next
                return current  # Return the deleted task
            prev = current
            current = current.next
        return None

    def update_task(self, task_id, done):
        """ Update a task's completion status """
        current = self.head
        while current:
            if current.id == task_id:
                current.done = done
                return current
            current = current.next
        return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/tasks', methods=['GET'])
def get_tasks():
    """ Get all tasks """
    return jsonify(task_list.get_tasks())

@app.route('/task/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """ Get a single task """
    task = task_list.get_task(task_id)
    if task:
        return jsonify(task)
    return jsonify({"error": "Task not found"}), 404

@app.route('/task', methods=['POST'])
def add_task():
    """ Add a new task """
    data = request.json
    if "title" not in data or "description" not in data:
        return jsonify({"error": "Missing title or description"}), 400
    
    new_task = task_list.add_task(
        title=data["title"],
        description=data["description"],
        date=data.get("date"),
        done=data.get("done", False)
    )
    return jsonify({
        "id": new_task.id,
        "title": new_task.title,
        "description": new_task.description,
        "date": new_task.date,
        "done": new_task.done
    }), 201

@app.route('/task/<int:task_id>', methods=['PUT'])
def mark_task_done(task_id):
    """ Update task's completion status """
    data = request.json
    if "done" not in data:
        return jsonify({"error": "Missing done status"}), 400

    updated_task = task_list.update_task(task_id, data["done"])
    if updated_task:
        return jsonify({"message": "Task updated"}), 200
    return jsonify({"error": "Task not found"}), 404

@app.route('/task/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """ Delete a task """
    if task_list.delete_task(task_id):
        return '', 204
    return jsonify({"error": "Task not found"}), 404

if __name__ == '__main__':
    task_list = TaskLinkedList()  # Initialize task list
    app.run(debug=True)